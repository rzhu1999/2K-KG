import scrapy
import re, uuid, logging
from datetime import datetime
import csv
import pathlib
import os

from nba_players.items import NbaPlayerItem

class Basicinfo21Spider(scrapy.Spider):
    name = 'basicinfo21'
    allowed_domains = ['hoopshype.com']
    start_urls = ['http://www.hoopshype.com/nba2k/2020-2021']
    #custom_settings = {
    #    'ITEM_PIPELINES': {
    #        'nba_players.pipelines.playerPipeline':300
    #    }
    #}

    def parse(self, response):
        players = []
        
        
        raw_player = response.xpath("//table[@class='hh-salaries-ranking-table hh-salaries-table-sortable responsive']"
                                    "//tbody"
                                    "//tr")
        
        for each in raw_player:
            player_obj = NbaPlayerItem()
            name = each.xpath("./td[@class = 'name']/a/text()").extract_first()
            if name is not None:
                name = name.strip("\n").strip("\t")
            else:
                continue
            overallRating = each.xpath("./td[@class = 'value']/text()").extract_first().strip("\n").strip("\t")

            player_link = "http://hoopshype.com" + each.xpath("./td[@class='name']/a/@href").extract_first()

            player_obj['overallRating'] = overallRating
            player_obj["player_link"] = player_link
            players.append(player_obj)       

        #print(players[0])
        return players
