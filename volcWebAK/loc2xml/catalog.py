#!/usr/bin/python
#simple class to hold earthquake catalogs
#Victor Kress, PNSN, Seattle, 11/19/2009
#$Id: catalog.py 140 2010-01-30 00:17:42Z kress $

import pickle
import UWevent
import sys
import os.path
import time
import datetime
import re
import timezones

version='$Id: catalog.py 140 2010-01-30 00:17:42Z kress $'

class catalog():
    def __init__(self):
        self.starttime=None
        self.endtime=None
        self.data=[]
        return
    def purgeByTimeWindow(self,start,end):
        '''
        Go through class data and remove all entries not
        in time window.
        '''
        if not self.data: #noop on empty data
            return
        #test for active bounds
        trimstart=self.starttime<start
        trimend=self.endtime>end
        if trimstart: self.starttime=start
        if trimend: self.endtime=end
        if trimstart or trimend:  
            newdat=[]
            for e in self.data:
                add = true
                if trimstart:
                    add = e.originTime>=start
                if trimend:
                    add = add and e.originTime<=end
                if add:
                    newdat.append(e)
            self.data=newdat
        return
    def getUWbyTimeWindow(self,start,end,catalogRoot='~seis/P'):
        '''
        reads UW catalog and loads all events between starttime 
        and endtime
        catalogRoot is optional root directory for catalog
        '''
        # check for consistent time window
        if not self.starttime or start<self.starttime:
            self.starttime=start
        if not self.endtime or end>self.endttime:
            self.endtime=end
        # path issues
        if catalogRoot[0]=='~':
            catalogRoot=os.path.expanduser(catalogRoot)
        if not os.path.isdir(catalogRoot):
            print 'catalogRoot="%s"'%catalogRoot
            print ' not accessible in getCatalogByTimeWindow()'
            return
        # look through data
        fnstr='%Y%m%d%H%M'
        iyr=start.year
        imo=start.month
        ieyr=end.year
        iemo=end.month
        while iyr<ieyr or (iyr==ieyr and imo<=iemo):
            syr=('%d'%iyr)[2:]
            dirstr='%s/%2s%2d'%(catalogRoot,syr,imo)
            if os.path.isdir(dirstr):
                archfile='%s/%2s%2d.a'%(dirstr,syr,imo)
                if os.path.isfile(archfile): 
                    print 'Reading from archive '+archfile
                    # archived data 
                    ecat=catalog()
                    ecat.readUWArchiveFile(archfile)
                    ecat.purgeByTimeWindow(start,end)
                    for e in ecat:
                        if e.magnitude[0]:
                            self.data.append(e)
                    
                else:  # unarchived data
                    #print 'reading pickfiles from %s' % dirstr
                    files=os.listdir(dirstr)
                    for f in files:
                        if re.match(r'[\d]{11}[\D]{1}',f):
                            fstr=dirstr+'/'+f
                            newp=UWevent.UWevent(fstr)
                            if newp.magnitude[0] and \
                                    newp.originTime>=start and newp.originTime<=end:
                                #print '\tadding event from %s' % f
                                self.data.append(newp)
            # increment month and year
            if imo<12 or iyr==ieyr:#increment past 12 in last year in case iemo==12 
                imo+=1
            else:
                iyr+=1
                imo=1
        return
    def getAQMSbyTimeWindow(self,start,end,connectStr):
        import CheetahTools
        if not self.starttime or start<self.starttime:
            self.starttime=start
        if not self.endtime or end>self.endttime:
            self.endtime=end
        d=CheetahTools.getCatalogByTimeWindow(start,end,connectStr)
        self.data += d
        return
    def readUWLocFile(self,filename):
        '''
        read UW loc summary files into catalog
        @param filename loc file name.
        '''
        f=open(filename,'r')
        e=UWevent.UWevent()             #create data holder
        for l in f:
            if e.parseACard(l.strip()):  #read card
                if self.starttime:
                    if e.originTime<self.starttime:
                        self.starttime=e.originTime
                else:
                    self.starttime=e.originTime
                if self.endtime:
                    if e.originTime>self.endtime:
                        self.endtime=e.originTime
                else:
                    self.endtime=e.originTime
                self.data.append(e)   #append to list
                e=UWevent.UWevent()     #create new holder
        return
    def readUWArchiveFile(self,filename):
        '''
        Helper utility to read UW archive files
        @param filename archive file.
        @return list of events read from archive file
        '''
        f=open(filename,'r')
        l=f.readline()
        #first line is identifier
        if not l.strip()=='!<arch>':
            print '%s not archive file. Exiting catalog.readUWArchiveFile().'%filename
            return
        l=f.readline()
        while l:
            if l[:11].isdigit():
                e=UWevent()
                e.eventId=l.split('/')[0]
                l=e.readCards(f)
                if self.starttime:
                    if e.originTime<self.starttime:
                        self.starttime=e.originTime
                else:
                    self.starttime=e.originTime
                if self.endtime:
                    if e.originTime>self.endtime:
                        self.endtime=e.originTime
                else:
                    self.endtime=e.originTime
                self.data.append(e)
            else:
                l=f.readline()
        f.close()
        return
    def sortByOriginTime(self,reverse=False):
        '''
        sorts data by originTime in increasing order
        optional True reverse argument will reverse sort order
        '''
        self.data.sort(lambda x,y: cmp(x.originTime,y.originTime))
        if reverse:
            self.data.reverse()
        return
    def purge(self):
        self.data=[]
        self.starttime=self.endtime=None
        return
    def writeXML(self,filename,defaultIconStyle='2'):
        '''
        method writes catalog to xml file specified by filename
        '''
        iconStyle=defaultIconStyle
        networkCode='AK'
        versionNo=1
        # header
        now=datetime.datetime.now().replace(tzinfo=timezones.Hawaii)
        ltstr=now.strftime('%a %b %d, %Y %H:%M:%S %Z')
        utc=datetime.datetime.utcnow().replace(tzinfo=timezones.UTC())
        utstr=utc.strftime('%Y%m%d%H%M%S')
        f=open(filename,'w')
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<merge fileTime_loc="%s" fileTime_utc="%s">\n'%(ltstr,utstr))
        self.sortByOriginTime(True) #reverse time sort (stratigraphic order)
        # loop through date
        for i in range(len(self.data)):
            if defaultIconStyle=='v':
                if i<=5:
                    iconStyle='0'
                elif i<=10:
                    iconStyle='1'
                elif i<=20:
                    iconStyle='2'
                else:
                    iconStyle='3'
            e=self.data[i]
            etime=e.originTime.replace(tzinfo=timezones.UTC())
            secs=etime.second+etime.microsecond*1.e-6
            localtstr=etime.astimezone(timezones.Hawaii).strftime('%a %b %d, %Y %H:%M:%S %Z')
            f.write('<event id="%s"'%etime.strftime('%m%d%H%M'))
            f.write(' network-code="%s"'%networkCode)
            f.write(' time-stamp="%s" '%now.strftime('%Y/%m/%d_%H:%M:%S'))
            f.write('version="%d">\n'%versionNo)
            f.write('<param name="year" value="%4d"/>\n'%etime.year)
            f.write('<param name="month" value="%02d"/>\n'%etime.month)
            f.write('<param name="day" value="%02d"/>\n'%etime.day)
            f.write('<param name="hour" value="%02d"/>\n'%etime.hour)
            f.write('<param name="minute" value="%02d"/>\n'%etime.minute)
            f.write('<param name="second" value="%5.2f"/>\n'%secs)
            if e.coordinate:
                f.write('<param name="latitude" value="%.4f"/>\n'%e.coordinate.latitude)
                f.write('<param name="longitude" value="%.4f"/>\n'%e.coordinate.longitude)
            if e.depth:
                f.write('<param name="depth" value="%.2f"/>\n'%e.depth)
            if e.magnitude[0]:
                f.write('<param name="magnitude" value="%.2f"/>\n'%e.magnitude[0].magnitude)
            f.write('<param name="num-stations" value="%d"/>\n'%e.nStation)
            f.write('<param name="num-phases" value="%d"/>\n'%e.nPhase)
            f.write('<param name="dist-first-station" value="%.2f"/>\n'%e.mindelta)
            f.write('<param name="rms-error" value="%.2f"/>\n'%e.rms)
            f.write('<param name="hor-error" value="%.2f"/>\n'%e.error)
            f.write('<param name="azimuthal-gap" value="%.2f"/>\n'%e.gap)
            f.write('<param name="local-time" value="%s"/>\n'%localtstr)
            f.write('<param name="icon-style" value="%s"/>\n'%iconStyle)
            f.write('</event>\n')
        f.write('</merge>\n')
        f.close()
        return

    #container methods
    def __getitem__(self,i):
        return self.data.__getitem__(i)
    def __setitem__(self,i,d):
        if d.originTime<self.starttime: self.starttime=d.originTime
        if d.originTime>self.endtime: self.endtime=d.originTime
        self.data[i]=d
        return
    def __delitem__(self,i):
        self.data.__delitem__(i)
        return
    def __len__(self):
        return self.data.__len__()
    def __contains__(self,d):
        return self.data.__contains__(d)
    def __iter__(self):
        return self.data.__iter__()
    def append(self,d):
        if not self.starttime or d.originTime<self.starttime:
            self.starttime=d.originTime
        if not self.endtime or d.originTime>self.endtime: 
            self.endtime=d.originTime
        self.data.append(d)
        return
    def save(cat,filename):
        outf=open(filename,'w')
        pickle.dump(cat,outf)
        outf.close()
        return

def loadCatalog(filename):
    inf=open(filename,'r')
    cat=pickle.load(inf)
    inf.close()
    return cat

def parseTimeStr(timeStr):
    '''
    parse time where time is of format YYYYMMDD_HH:MM:SS
    UTC assumed unless time ends in 'L'
    'now' is a valid argument
    returns datetime object
    '''
    tformat='%Y%m%d_%H:%M:%S'

    if timeStr=='now':       #now is a valid argument
        dt=datetime.datetime.utcnow()
    else:
        try:
            dt=datetime.datetime.strptime(timeStr[:17],tformat)
        except ValueError:
            print 'Fatal: Could not interpret time string %s'%timeStr
            print 'Must be of format YYYYMMDD_HH:MM:SS'
            return 0
        if timeStr[-1]=='L':  #input time was local. Convert to UTC
            dt+=datetime.timedelta(0,time.timezone)
    return dt


if __name__=='__main__':
    '''
    As program, this will get catalog from specified window and save to file.
    '''
    usage='''
Usage: catalog.py <options> starttime endtime

Options:

--UW <catalogRootDirectory> (defaults to ~seis/P)
--AQMS <connectString> (defaults to something that won't work :)
              e.g. 'trinetdb/tdbpassword@//shuksan:1521/archdb'
starttime and endtime are of the form YYYYMMDD_HH:MM:SS. 
Interpreted as UTC by default or local time if last character is 'L'.

@Param starttime start of time window
@param endtime end of time window
'''
    from getopt import getopt,GetoptError
    uwcat=aqscat=0
    try:
        opts,args = getopt(sys.argv[1:],'h',['help','UW=','AQMS='])
    except GetoptError:
        print 'Error reading option list'
        print usage
        sys.exit(1)
    if len(args)<2:
        print 'Version: '+version
        print usage
        sys.exit(0)
    for o,a in opts:    
        if o=='--help' or o=='-h':
            print 'Version: '+version
            print usage
            sys.exit(0)
        if o=='--UW':
            if a:
                uwcat=a
            else:
                uwcat='~seis/P'
        if o=='--ACQ':
            if a:
                aqscat=a
            else:
                aqscat=raw_input('ACQ database connect string: ')

    start=parseTimeStr(args[0])
    end=parseTimeStr(args[1])

    if end<=start:
        print 'Inconsistent time window'
        sys.exit(1)

    cat=catalog()
    if uwcat:
        cat.getUWbyTimeWindow(start,end,uwcat)
    if aqscat:
        cat.getAQMSbyTimeWindow(start,end,aqscat)

    print '%d events loaded into catalog'%len(cat)
    outfn=raw_input('File name to save catalog to: ')
    cat.save(outfn)
    sys.exit(0)
