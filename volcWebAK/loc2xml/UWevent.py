#UWevent.py
#python class to hold uw pickfile data
#Victor Kress, PNSN 10/12/09
#$Id: UWevent.py 140 2010-01-30 00:17:42Z kress $

import math
import datetime
import re

#utility functions
def dd2DM(decDegrees):
    (m,d)=math.modf(decDegrees)
    m *= 60.
    return (d,m)
def dd2DMS(decDegrees):
    (d,dm)=dd2DM(decDegrees)
    (s,m)=math.modf(dm)
    s *= 60.
    return (d,m,s)
def DMS2dd(degrees,minutes=0.,seconds=0.):
    dd=degrees+(minutes+seconds/60.)/60.
    return dd

#classes
class LatLon():
    '''
    class to hold decimal lattitude and decimal longitude
    '''
    def __init__(self,lat=None,lon=None):
        if isinstance(lat,list) or isinstance(lat,tuple):
            self.latitude=DMS2dd(*lat)
        else:
            self.latitude=lat
        if isinstance(lon,list) or isinstance(lon,tuple):
            self.longitude=DMS2dd(*lon)
        else:
            self.longitude=lon
        return
    def parseLat(self,latStr):
        deg=float(latStr[:3])
        sstr=latStr[3]
        min=float(latStr[4:])/100.
        self.latitude=DMS2dd(deg,min)
        if sstr in 'Ss-':
            self.latitude=-self.latitude
        return
    def parseLon(self,lonStr):
        deg=float(lonStr[:3])
        sstr=lonStr[3]
        min=float(lonStr[4:])/100.
        self.longitude=DMS2dd(deg,min)
        if sstr in 'Ww-':
            self.longitude*=-1.
        return
    def getLatStr(self):
        lat=self.latitude
        if lat<0:
            lat=-lat
            ns='S'
        else:
            ns='N'
        (d,m)=dd2DM(lat)
        m*=100.
        lstr='%03d%1s%04d'%(d,ns,int(m))
        return lstr
    def getLonStr(self):
        lon=self.longitude
        if lon<0:
            lon=-lon
            ew='W'
        else:
            ew='E'
        (d,m)=dd2DM(lon)
        m*=100.
        lstr='%04d%1s%04d'%(d,ew,int(m))
        return lstr
    def getDistance(self,other):
        """
        Caclulate distance to input LatLon from self in kilometers
        """
        r=6371.
        rad = math.pi / 180.0
        dlat=(other.latitude-self.latitude)*rad
        dlon=(other.longitude-self.longitude)*rad
        a=math.pow(math.sin(dlat/2.),2) + \
            math.cos(self.latitude*rad)*math.cos(other.latitude*rad)\
            *math.pow(math.sin(dlon/2.),2)
        c=2.*math.atan2(math.sqrt(a),math.sqrt(1.-a))
        return r*c
    def getBearing(self,other):
        '''
        Calculate bearing to imput LatLon from self in radians
        '''
        rad = math.pi / 180.0
        dlon=(other.longitude-self.longitude)*rad
        lat1=self.latitude*rad
        lat2=other.latitude*rad
        a=math.sin(dlon)*math.cos(lat2)
        b=math.cos(lat1)*math.sin(lat2) - \
            math.sin(lat1)*math.cos(lat2)*math.cos(dlon)
        theta=math.atan2(a,b)
        #convert to conventional cw from north
        theta=theta/math.pi+2.
        if theta>=2.0: theta-=2.0
        return theta*math.pi

class EventMag():
    def __init__(self,m,t,s):
        self.magnitude=m
        self.type=t
        self.source=s
        self.velocityModel=None
        self.RMS=None
        self.meanRMS=None
        self.sdMean=None
        self.sd=None
        self.sswRes=None
        self.ndfr=None
        self.fixXYZT=None
        self.sdx=None
        self.sdy=None
        self.sdz=None
        self.sdt=None
        self.meanUncertainty=None
        return

class EventChannel():
    '''
    class to hold picks and channel info
    '''
    def __init__(self,sta='',chan=''):
        self.station=sta
        self.channel=chan
        self.duration=None
        self.WoodAndersonTime=None
        self.WoodAndersonAmplitude=None
        self.phases=[]  #list of phase picks (EventChannelPhase classes)
        return

class EventChannelPhase():
    '''
    class to hold event phase data
    '''
    def __init__(self):
        self.type=None
        self.polarity=None
        self.arrivalTime=None
        self.timeUncertainty=None
        self.timeResidual=None
        self.amplitude=None
        self.amplitudeTime=None
        self.quality=None
        self.stats=None
        return

class UWevent():
    def __init__(self,filename=0):
        self.eventId=None
        self.eventType=None
        self.originTime=None
        self.coordinate=0 # holds LatLon object
        self.depth=None  #km
        self.fix=None
        self.magnitude=[0] #coda length magnitude always magnitudes[0]
        self.nStation=0  #number of stations used in event
        self.nPhase=0    #number of phases used in event
        self.channel={} #dictionary of EventChannel's keyed on [station.channel] 
        self.gap=0.      #largest azimuthal angle containing no stations
        self.mindelta=0  #distance to nearest station
        self.rms=0       #root mean square residual for fit
        self.error=0     #hypocenter uncertainty in km 
        self.Q1=0        #travel time quality factor (A-D)
        self.Q2=0        #station distribution quality factor (A-D)
        self.velocityModel=''
        self.comment=[]  #list of strings
        self.phase=[]    #list of phases
        self.picker=''   #person who made pick
        self.regionCode=''#region code (from filename)
        if filename:
            self.readPickfile(filename)
        return

    def parseACard(self,aline):
        '''
        @param "a-card" line to be parsed
        @return 1 for successful read. 0 for no read
        '''
        linelen=len(aline)
        if linelen==0 or aline[0]!='A':
            return 0
        if not aline[1]==' ':
            self.eventType=aline[1]
        timestr=aline[2:14].strip()
        self.originTime=datetime.datetime.strptime(timestr,'%Y%m%d%H%M')
        try:
            self.originTime+=datetime.timedelta(0,float(aline[14:20]))
        except ValueError: 
            return 0
        if linelen<38:
            return 1
        latstr=aline[20:29]
        lonstr=aline[29:38]
        self.coordinate=LatLon()
        self.coordinate.parseLat(latstr)
        self.coordinate.parseLon(lonstr)
        tok=aline[38:43].strip()
        if tok:
            self.depth=float(tok)
        self.fix=aline[43]
        tok=aline[44:49].strip()
        if tok:
            m=float(tok)
            self.magnitude[0]=EventMag(m,'Mc','')
        self.nStation=int(aline[49:51])
        self.nPhase=int(aline[52:55])
        self.gap=int(aline[55:59])
        self.mindelta=int(aline[59:62])
        tok=aline[62:67].strip()
        if tok:
            self.rms=float(tok)
        tok=aline[67:72].strip()
        if tok:
            self.error=float(tok)
        self.Q1=aline[72]
        self.Q2=aline[73]
        self.velocityModel=aline[75:]
        return 1

    def parsePickCard(self,pline):
        if pline[0]!='.':
            return ''
        staChan=pline.split()[0][1:]
        if not self.channel.haskey(staChan):
            (sta,chan)=staChan.split('.')
            newsc=EventChannel(sta,chan)
            self.channel[staChan]=newsc
        dlist=re.findall(r'\((.*?)\)',pline)
        for item in dlist:
            x=item.split()
            if x[0] in 'pP':
                tp=x[1]
                pexist=False
                for p in self.channel[staChan].phases:
                    if p.type==tp:   # should not ever happen
                        pexist=True
                        break
                if not pexist:
                    p=EventChannelPhase()
                    p.type=tp
                    self.channel[staChan].phases.append(p)
                p.polarity=x[2]
                p.time=float(x[3])
                if x[4] != '_':
                    p.quality=int(x[4])
                if x[5] != '_':
                    p.timeUncertainty=float(x[5])
                if x[6] != '_':
                    p.timeResidual=float(x[6])
            elif x[0] in 'dD':
                self.channel[staChan].duration=float(x[1])
            elif x[0]=='A':
                tp=x[1]
                tm=float(x[2])
                amp=int(x[3])
                pexist=False
                for p in self.channel[staChan].phases:
                    if p.type==tp:
                        pexist=True
                        break
                if not pexist:
                    p=EventChannelPhase()
                    self.channel[staChan].append(p)
                p.type=tp
                p.amplitudeTime=tm
                p.amplitude=amp
            elif x[0]=='a':
                if x[1]=='WA':
                    self.channel[staChan].WoodAndersonTime=float(x[2])
                    self.channel[staChan].WoodAndersonAmplitude=float(x[3])
        return

    def parseECard(self,eline):
        if not eline[0]=='E':
            print 'could not parse E-line:'
            print eline
            return
        if eline[1:].strip()=='0.000':
            return
        if not self.magnitude[0]:
            self.magnitude[0]=EventMagnitude()
        self.magnitude[0].velocityModel=eline[2:4]
        self.magnitude[0].RMS=float(eline[4:10])
        self.magnitude[0].meanRMS=float(eline[10:16])
        self.magnitude[0].sdMean=float(eline[16:22])
        self.magnitude[0].sd=float(eline[22:28])
        self.magnitude[0].sswRes=float(eline[28:36])
        self.magnitude[0].ndfr=float(eline[36:40])
        self.magnitude[0].fixXYZT=eline[40:44]
        self.magnitude[0].sdx=float(eline[45:50])
        self.magnitude[0].sdy=float(eline[50:55])
        self.magnitude[0].sdz=float(eline[55:60])
        self.magnitude[0].sdt=float(eline[60:65])
        self.magnitude[0].magnitude=float(eline[65:70])
        self.magnitude[0].meanUncertainty=float(eline[75:79])
        return

    def parseSCard(self,line):
        if line[0] in 'sS':
            return
        start=1  #skips first S
        final=len(line)
        end=start+8
        while end<=final:   #don't read past EOL     
            mag=line[start:end]
            m=float(mag[:5])
            t=mag[5:7]
            s=mag[7]
            self.magnitude.append(EventMag(m,t,s))
            start=end
            end+=8
        return

    def readPickfile(self,filename):
        import os.path
        pfile=open(filename,'r')
        self.eventId=os.path.basename(filename)
        self.regionCode=filename[-1]
        self.readCards(pfile)
        return

    def readCards(self,pfi):
        '''
        @param pfi open file for input
        @return line that resulted in method return
        '''
        line=pfi.readline().strip()
        while line:
            if line[:11].isdigit():
                return line #in archives, this indicates new event
            if line[0]=='A':
                self.parseACard(line)
            elif line[0]=='E':
                self.parseECard(line)
            elif line[0]=='.':
                self.parsePickCard(line)
            elif line[0] in 'Ss':
                self.parseSCard(line)
            elif line[0] in 'Cc':
                p=re.findall(r'[Cc] LOCATED BY[ ]*(\w*)',line)
                if p:                    
                    self.picker=p[0]
                self.comment.append(line[2:-1]) #leave out c and newline
            #else:
                #print 'Not processed: '+line
            line=pfi.readline().strip()
            #end of while loop
        return line

    def getACard(self):
        centisec=int(math.modf(self.originTime.microsecond/10000)[1])
        pfstr=self.originTime.strftime('%Y%m%d%H%M %S.')+'%2d'%centisec
        latstr=self.coordinate.getLatStr()
        lonstr=self.coordinate.getLonStr()
        etp=self.eventType
        if not etp: 
            etp=' '
        fx=self.fix
        if not fx:
            fx=' '
        print 'A%1s%16s%8s%9s'%(etp,pfstr,latstr,lonstr),
        if self.depth:
            print '%6.2f%1s%4.1f'%(self.depth,fx,
                                   self.magnitude[0].magnitude),
        else:
            print '           ',
        acard='%3d/%03d%4d%3d%5.2f%5.1f%1s%1s %2s'%(self.nStation,
                                                    self.nPhase,self.gap,
                                                    self.mindelta,self.rms,
                                                    self.error,self.Q1,
                                                    self.Q2,
                                                    self.velocityModel)
        return acard

    def getECard(self):
        ecard=''
        if self.magnitude[0].velocityModel:
            ecard+='%2s'%self.magnitude[0].velocityModel
        else:
            ecard+='  '
        if self.magnitude[0].RMS:
            ecard+='%6f'%self.magnitude[0].RMS
        else:
            ecard+='      '
        if self.magnitude[0].meanRMS:
            ecard+='%6f'%self.magnitude[0].meanRMS
        else:
            ecard+='      '
        if self.magnitude[0].sdMean:
            ecard+='%6f'%self.magnitude[0].sdMean
        else:
            ecard+='      '
        if self.magnitude[0].sd:
            ecard+='%6s'%self.magnitude[0].sd
        else:
            ecard+='      '
        if self.magnitude[0].sswRes:
            ecard+='%8f'%self.magnitude[0].sswRes
        else:
            ecard+='        '
        if self.magnitude[0].ndfr:
            ecard+='%4f'%self.magnitude[0].ndfr
        else:
            ecard+='    '
        if self.magnitude[0].fixXYZT:
            ecard+='%4s'%self.magnitude[0].fixXYZT
        else:
            ecard+='    '
        if self.magnitude[0].sdx:
            ecard+='%5f'%self.magnitude[0].sdx
        else:
            ecard+='     '
        if self.magnitude[0].sdy:
            ecard+='%5f'%self.magnitude[0].sdy
        else:
            ecard+='     '
        if self.magnitude[0].sdz:
            ecard+='%5f'%self.magnitude[0].sdz
        else:
            ecard+='     '
        if self.magnitude[0].sdt:
            ecard+='%5f'%self.magnitude[0].sdt
        else:
            ecard+='     '
        if self.magnitude[0].magnitude:
            ecard+='%5f'%self.magnitude[0].magnitude
        else:
            ecard+='     '
        if self.magnitude[0].meanUncertainty:
            ecard+='%4f'%self.magnitude[0].meanUncertainty
        else:
            ecard+='    '
        ecard=ecard.strip()
        if ecard:
            return 'E '+ecard
        else:
            return ''

    def getPickCards(self):
        plines=''
        for p in self.phase:
            plines+='.%s.%s '%(p.station,p.channel)
            if p.type in 'sp':
                s='%s %s %f'%(p.type,p.polarity,p.time)
                if p.quality:
                    s+=' %d'%p.quality
                else:
                    s+=' _'
                if p.timeUncertainty:
                    s+=' %f'%p.timeUncertainty
                else:
                    s+=' _'
                if p.timeResidual:
                    s+=' %d'%p.timeResidual
                else:
                    s+=' _'
                plines+=' (%s)'%s
            if p.duration!=None:
                plines+=' (d %f)'%p.duration
            if p.amplitude!=None:
                plines+=' (A %f)'%p.amplitude
            if p.WoodAndersonAmp!=None:
                plines+=' (a %f %f)'%(p.time,p.WoodAndersonAmp)
            plines+='\n'
        return plines

    def getSCard(self):
        if len(self.magnitude)<=1:
            return ''
        scard='S'
        for mag in self.magnitude[1:]:
            scard+='%5f%2s%1s'%(mag.magnitude,mag.type,mag.source)
        return scard

    def printPickfile(self):
        print self.getACard()
        s=self.getECard()
        if s: print s
        s=self.getPickCards()
        if s: print s
        s=self.getSCard()
        if s: print s
        return


