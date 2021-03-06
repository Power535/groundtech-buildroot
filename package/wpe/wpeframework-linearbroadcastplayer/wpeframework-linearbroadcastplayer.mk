################################################################################
#
# wpeframework-linearbroadcastplayer
#
################################################################################

WPEFRAMEWORK_LINEARBROADCASTPLAYER_VERSION = 18595aeb9bb4115ff4f992a81dd4170705f13b12
WPEFRAMEWORK_LINEARBROADCASTPLAYER_SITE_METHOD = git
WPEFRAMEWORK_LINEARBROADCASTPLAYER_SITE = git@github.com:WebPlatformForEmbedded/WPELinearBroadcastPlayer.git
WPEFRAMEWORK_LINEARBROADCASTPLAYER_INSTALL_STAGING = YES
WPEFRAMEWORK_LINEARBROADCASTPLAYER_DEPENDENCIES = wpeframework

WPEFRAMEWORK_LINEARBROADCASTPLAYER_CONF_OPTS += -DBUILD_REFERENCE=${WPEFRAMEWORK_LINEARBROADCASTPLAYER_VERSION}

ifeq ($(BR2_PACKAGE_WPEFRAMEWORK_DEBUG),y)
WPEFRAMEWORK_LINEARBROADCASTPLAYER_CONF_OPTS += -DCMAKE_CXX_FLAGS='-g -Og'
endif

ifeq ($(BR2_PACKAGE_UMA_SDK),y)
WPEFRAMEWORK_LINEARBROADCASTPLAYER_CONF_OPTS += -DPLAYER_IMPLEMENTATION=NOS
else ifeq ($(BR2_PACKAGE_AAMP),y)
WPEFRAMEWORK_LINEARBROADCASTPLAYER_CONF_OPTS += -DPLAYER_IMPLEMENTATION=Aamp
else
WPEFRAMEWORK_LINEARBROADCASTPLAYER_CONF_OPTS += -DPLAYER_IMPLEMENTATION=Stub
endif

$(eval $(cmake-package))

