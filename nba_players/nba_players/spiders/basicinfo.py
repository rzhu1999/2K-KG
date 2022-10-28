
import scrapy

import re, uuid, logging
from datetime import datetime
import csv
import pathlib
import os

from nba_players.items import NbaPlayerItem

class BasicinfoSpider(scrapy.Spider):
    name = 'basicinfo'
    allowed_domains = ['www.2kratings.com']
    start_urls = ['http://www.2kratings.com/lists/top-100-classic-players']

    def parse(self, response):
        players = []
        
        
        raw_player = response.xpath("//table[@class='table table-striped table-sm table-hover overflow-hidden mb-0']"
                                    "//tbody"
                                    "//tr"
                                    "//td")

        for each in raw_player:
            player_obj = NbaPlayerItem()
            name = each.xpath("./div[@class='entries']/span[@class='entry-font']/a/text()").extract_first()
            overallRating = each.xpath("./span[contains(@class, 'attribute-box dark-matter')]/text()").extract_first()
            #threesRating= each.xpath("./text()").extract_first()[7]  
            #dunkRating = each.xpath("./a/@href").extract_first()
            avatar_link = each.xpath("./div[@class='entries']/a/span/img/@src").extract_first()
            #position =
            height = each.xpath("./div[@class='entries']/span[@class='entry-subtext-font']/a[contains(@href, 'height')]/text()").extract_first()
            team = each.xpath("./div[@class='entries']/span[@class='entry-subtext-font']/a[contains(@href, 'teams')]/@title").extract_first()
            
            player_obj['name'] = name
            player_obj['overallRating'] = overallRating
            player_obj["avatar_link"] = avatar_link
            player_obj['height'] = height
            player_obj['team'] = team

            players.append(player_obj)       

        print(players)
        return players
