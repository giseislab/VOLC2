#!/usr/bin/python
'''
Program that reads UW "loc" files and writes xml files
@author Victor Kress
PNSN, Seattle 12/08/09
$Id: loc2xml.py 140 2010-01-30 00:17:42Z kress $
'''
import sys
import os.path
import catalog
from getopt import getopt,GetoptError

versionNo='$Id: loc2xml.py 140 2010-01-30 00:17:42Z kress $'[1:-1]
usage='''
Usage: loc2xml.py [--icon newicon] locationFile xmlFile
where newicon is a new value for icon-style. Defaults to '2'.
"--icon v" invokes rank coloring of icons by origin time 
'''
iconStyle='2'
try:
    opts,args = getopt(sys.argv[1:],'h',['help','icon='])
except GetoptError:
    print 'Error reading option list'
    print usage
    sys.exit(1)
if len(args)<2:
    print 'Version: '+versionNo
    print usage
    sys.exit(1)
for o,a in opts:    
    if o=='--help' or o=='-h':
        print 'Version: '+versionNo
        print usage
        sys.exit(0)
    if o=='--icon':
        if a:
            iconStyle=a

c=catalog.catalog()
c.readUWLocFile(args[0])
print 'Read %d events from %s'%(len(c),args[0])
c.writeXML(args[1],iconStyle)
print 'wrote XML to %s. Done'%args[1]
sys.exit(0)



