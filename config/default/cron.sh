#!/bin/bash

case ${1} in
    reboot )
        sleep $((RANDOM%30+30)) && searchd --config $(dirname ${0})/sphinx.conf
    ;;
    hourly )
        sleep $((RANDOM%120)) && node $(dirname $(dirname ${0}))/lib/CP_cron.js
    ;;
    daily )
        sleep $((RANDOM%60)) && $(dirname ${0})/i 11 "${2}" "${3}" "${4}" 1
    ;;
    * )
        exit 0
    ;;
esac