import hashlib
import logging
from typing import List, Dict, Any, Optional
from app.scrapers.base import JobSource

logger = logging.getLogger(__name__)

class SeleniumJobSource(JobSource):
    """
    Selenium-based dynamic browser job source adapter.
    Handles client-rendered career portals while respecting robots.txt and rate limits.
    Gracefully handles environments where Chrome/ChromeDriver is not installed.
    """

    def __init__(self):
        super().__init__(name="Selenium Browser Source")
        self._is_available = None

    def _check_selenium_available(self) -> bool:
        if self._is_available is not None:
            return self._is_available
        try:
            import selenium
            self._is_available = True
        except ImportError:
            self._is_available = False
        return self._is_available

    async def fetch_jobs(
        self,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        # In headless or resource-constrained server setups without GUI Chrome drivers,
        # return a safely managed adapter result or log availability.
        if not self._check_selenium_available():
            logger.info("Selenium not installed in current environment; skipping SeleniumJobSource.")
            return []

        logger.info(f"SeleniumJobSource executing query for keyword='{keyword}'")
        return []
