# source these functions when getting started on the chip
# install the ssh agent

setup {
  sudo apt-get install avahi-daemon
}

# $1 - network name
# $2 - network pass

connect {
  sudo nmcli device wifi connect "$1" password "$2" ifname wlan0
}
