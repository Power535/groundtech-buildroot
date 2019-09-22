cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2 > /var/node/build/sn
