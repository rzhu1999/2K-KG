# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import json

class basicinfoPipeline(object):
    def open_spider(self, spider):
        self.output_name = 'players_basicinfo.jsonlines'
        self.output_file = open(self.output_name, 'wb')

    def process_item(self, item, spider):
        data = json.dumps(dict(item), ensure_ascii = False) + "\n"
        self.output_file.write(data.encode("utf-8"))
        return item
    
    def close_spider(self, spider):
        self.output_file.close()


class playerPipeline(object):
    def open_spider(self, spider):
        self.output_name = 'dading_shi_hw01_movie.jsonlines'
        self.output_file = open(self.output_name, 'wb')

    def process_item(self, item, spider):
        data = json.dumps(dict(item), ensure_ascii = False) + "\n"
        self.output_file.write(data.encode("utf-8"))
        return item
    
    def close_spider(self, spider):
        self.output_file.close()

