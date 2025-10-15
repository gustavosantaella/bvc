from os import getenv, environ
import time
from datetime import datetime, timezone, timedelta


def get_time_zone():
    return getenv("TIME_ZONE") or "America/Caracas"


def get_time_zone_offset():
    return getenv("TIME_ZONE_OFFSET") or "-04:00"


def set_time_zone():
    time_zone = get_time_zone()
    time_zone_offset = get_time_zone_offset()
    environ["TZ"] = time_zone

    # tzset() only available on Unix systems
    if hasattr(time, "tzset"):
        time.tzset()


def get_timezone_offset_timedelta():
    """Parse timezone offset string to timedelta"""
    offset_str = get_time_zone_offset()
    sign = 1 if offset_str[0] == "+" else -1
    hours, minutes = map(int, offset_str[1:].split(":"))
    return timedelta(hours=sign * hours, minutes=sign * minutes)


def get_current_time():
    """Get current time in configured timezone"""
    # Get UTC time and convert to local timezone
    utc_now = datetime.now(timezone.utc)
    local_tz = timezone(get_timezone_offset_timedelta())
    return utc_now.astimezone(local_tz)
