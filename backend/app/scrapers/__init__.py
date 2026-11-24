from app.scrapers.base import JobSource
from app.scrapers.api_source import APIJobSource
from app.scrapers.web_source import WebJobSource
from app.scrapers.selenium_source import SeleniumJobSource
from app.scrapers.demo_source import DemoJobSource

__all__ = [
    "JobSource",
    "APIJobSource",
    "WebJobSource",
    "SeleniumJobSource",
    "DemoJobSource",
]
