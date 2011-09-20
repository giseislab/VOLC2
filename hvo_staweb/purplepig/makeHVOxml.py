#!/usr/bin/python
# makeHVOxml.py
# script to create xml file for webi2 interface.
# adapted from Wes Thelen's makePNSNxml.m Matlab script by
# Victor Kress, PNSN, Seattle, 4/26/2010
# Adapted fro hvo, 8/5/2010
# $Id$

import MySQLdb
import random
import shutil
import sys
import commands

if __name__=='__main__':

    dbhost='localhost'
    dbport=3306
    dbname='W_ROOT'
    dbuser='wwsuser'
    dbpswrd='wwspass'
    outfile='sta_file.xml'
    spikedir='earthworm@hvo-web1:/web/SEIS/PNSN/WEBICORDER/BETTER/pnsn_staweb/purplepig/'
    excludeNet=('MI', 'US', 'NP', 'PT', 'IU')

    #query database
    db=MySQLdb.connect(host=dbhost,port=dbport,
                       user=dbuser,passwd=dbpswrd,db=dbname)
    c=db.cursor()

    c.execute('''select name,lon,lat from instruments''')
    ri=c.fetchall()  #get all rows
    c.execute('''select code from channels''')
    rc=c.fetchall()
    c.close()
    db.close()

    #parse results
    stacoord={}
    for r in ri:   #convert and add random offset of about a km
        stacoord[r[0]]=(float(r[2])+random.uniform(-.009,.009),
                        float(r[1])+random.uniform(-.004,.004)) #(lat,lon)
    hierarchy=['HWZ', 'EHZ', 'HHZ', 'BHZ', 'HNZ',
               'EHH','HNH','HHH', 'BHH', 'ELH']
    entries={}
    for r in rc:
        codelist = r[0].split('$')[:4] 
        if len(codelist) == 3:
            (sta,chan,net)=codelist
            loc='--'
        else:
            (sta,chan,net,loc)=codelist
        if net in excludeNet:
            continue  #skip to next
        if entries.has_key(sta):
            if entries[sta][3][2]=='Z':
                oc=entries[sta][3]
            else:
                oc=entries[sta][3][:2]+'H'
            if chan[2]=='Z':
                cc=chan
            else:
                cc=chan[:2]+'H'
            if not (cc in hierarchy and oc in hierarchy):
                print 'could not rank channels %s and %s'%(oc,cc)
                continue;
            if hierarchy.index(oc)<hierarchy.index(cc):
                continue; #already have better channel
        if stacoord.has_key(sta):
            (lat,lon)=stacoord[sta]
        else:
            print '%s missing from instruments table'%sta
            continue
	if chan[:2]=='HH': tp='BB'
        elif chan[:2]=='BH': tp='BB'
        elif chan[:2]=='HW': tp='BB'
        elif chan[:2]=='HN': tp='SM'
        else: tp='SP'
        entries[sta]=(lat,lon,sta,chan,net,loc,tp)

    #write xml
    f=open(outfile,'w')
    f.write('<markers>\n')
    kk=list(entries.keys())
    kk.sort()
    for k in kk:
        f.write('<marker lat="%.4f" lng="%.4f" station="%s" channel="%s" network="%s" location="%s" type="%s"/>\n'% entries[k] )
    f.write('</markers>\n')
    f.close()
    print '%s created'%outfile
    if len(sys.argv)>1 and sys.argv[1]=='-i':
        print 'installing to %s'%spikedir
        cmd='scp %s %s%s'%(outfile,spikedir,outfile)
        r=commands.getstatusoutput(cmd)
        if r[0]:
            print 'scp command failed: %s - %s'%r
        else:
            print 'success.'
    sys.exit(0)
