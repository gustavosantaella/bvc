from os import getenv, environ
import time
from datetime import datetime
from zoneinfo import ZoneInfo


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


def get_current_time():
    """Get current time in configured timezone (America/Caracas by default)"""
    tz_name = get_time_zone()
    try:
        # Use ZoneInfo to get the correct timezone
        tz = ZoneInfo(tz_name)
        return datetime.now(tz)
    except Exception:
        # Fallback to UTC if timezone not found
        return datetime.now(ZoneInfo("UTC"))
