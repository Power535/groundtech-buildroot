#!/bin/sh

CUSTOM_BOARD_DIR="$(dirname $0)"
GENIMAGE_CFG="${CUSTOM_BOARD_DIR}/genimage3.cfg"
GENIMAGE_TMP="${BUILD_DIR}/genimage.tmp"

echo "Post-image: processing $@"

# Override cmdline.txt
cat << __EOF__ > "${BINARIES_DIR}/rpi-firmware/cmdline.txt"
console=ttyS0,115200 ipv6.disable=1 consoleblank=0 vt.global_cursor_default=0 logo.nologo ignore_loglevel root=/dev/mmcblk0p2 rootwait
__EOF__

# Override config.txt
cat << __EOF__ > "${BINARIES_DIR}/rpi-firmware/config.txt"
kernel=zImage
gpu_mem_256=128
gpu_mem_512=196
gpu_mem_1024=384
boot_delay=0
disable_splash=1
enable_uart=1
avoid_warnings=1
dtparam=audio=on
force_turbo=1
framebuffer_width=480
framebuffer_height=320
hdmi_group=2
hdmi_mode=87
hdmi_cvt 480 320 60 6 0 0 0
hdmi_ignore_edid_audio=1
__EOF__

echo "Generating SD image"
rm -rf "${GENIMAGE_TMP}"

genimage                           \
	--rootpath "${TARGET_DIR}"     \
	--tmppath "${GENIMAGE_TMP}"    \
	--inputpath "${BINARIES_DIR}"  \
	--outputpath "${BINARIES_DIR}" \
        --config "${GENIMAGE_CFG}"

exit $?
