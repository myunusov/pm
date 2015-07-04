#!/bin/sh


JAVA_OPTS="-Xmx1024M -Xms1024M -Xss1M -XX:+UseParallelGC"

APP_CLASSPATH=./lib/*:./conf

# jmx
JMX_OPTS="-Dcom.sun.management.jmxremote.port=2649 -Djava.rmi.server.hostname=10.2.53.101 -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false"


java %JAVA_OPTS% %JMX_OPTS% -cp "%SPE_CLASSPATH%" org.maxur.perfmodel.backend.Launcher

exit
