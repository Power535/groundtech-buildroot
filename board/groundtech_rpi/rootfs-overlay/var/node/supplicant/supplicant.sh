FILE=/etc/wpa_supplicant.conf
SN=`cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2 | tail -c 8 | tr [a-z] [A-Z]`

echo 'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=TR

network={
   ssid="Discovery_'${SN}'"
   mode=2
   proto=RSN
   key_mgmt=WPA-PSK
   pairwise=CCMP TKIP
   group=CCMP TKIP
   psk="discovery"
}' > /etc/wpa_supplicant.conf

fi
