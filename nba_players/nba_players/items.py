# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class NbaPlayerItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    name = scrapy.Field()
    full_name = scrapy.Field()
    born = scrapy.Field()
    salary = scrapy.Field()
    weight = scrapy.Field()
    player_link = scrapy.Field()
    overallRating = scrapy.Field()
    #threesRating = scrapy.Field()
    #dunkRating = scrapy.Field()
    avatar_link = scrapy.Field()
    position = scrapy.Field()
    height = scrapy.Field()
    team = scrapy.Field()
    
    school= scrapy.Field()
    nationality = scrapy.Field()
    

    
    pass
