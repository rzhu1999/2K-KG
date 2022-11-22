#from termios import TIOCSER_TEMT
import scrapy
import jsonlines

from nba_players.items import NbaPlayerItem
class playerSpider(scrapy.Spider):
    name = 'player'
    players = []
    custom_settings = {
        'ITEM_PIPELINES': {
            'nba_players.pipelines.playerPipeline':301
        }
    }
    def start_requests(self):
        urls = []
        with jsonlines.open("basicinfo.jsonlines", "r") as jsonl_f:
            for content in jsonl_f:
                urls.append(content["player_link"])
        
        for url in urls:
            yield scrapy.Request(url = url, callback = self.parse)

        
    
    

    def parse(self, response):
        #players = []
        
        player_obj = NbaPlayerItem()
        #//li[span[contains(text(), 'Director')]]

        full_name = response.xpath("//div[@class = 'player-fullname']/text()").extract_first()

        team = response.xpath("//div[@class = 'player-team']/a/text()")
        born = 

        player_obj['title'] = title
        player_obj['directors'] = directors_list
        player_obj['directors_url'] = directors_urls_list
        player_obj['plot'] = plot
        player_obj['actors'] = actor_list
        print(player_obj)

        yield player_obj


        
        

   