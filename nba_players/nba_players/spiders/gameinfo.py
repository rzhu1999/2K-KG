#from termios import TIOCSER_TEMT
import scrapy
import jsonlines

from nba_players.items import NbaPlayerItem
class GameinfoSpider(scrapy.Spider):
    name = 'gameinfo'
    players = []
    #custom_settings = {
    #    'ITEM_PIPELINES': {
    #        'nba_players.pipelines.playerPipeline':301
    #    }
    #}
    headers = {"USER-AGENT": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        "Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582"}
    def start_requests(self):
        urls = []
        with jsonlines.open("/Users/derekshi/Desktop/DSCI558/2K-KG/nba_players/nba_players/player.jsonlines", "r") as jsonl_f:
            for content in jsonl_f:
                urls.append("https://www.2kratings.com/" + content["full_name"].split()[0].lower() + "-" + content["full_name"].split()[1].lower())
        
        for url in urls:
            yield scrapy.Request(url = url, callback = self.parse, headers = self.headers)

        
    
    

    def parse(self, response):
        #players = []
        
        player_obj = NbaPlayerItem()
        #//li[span[contains(text(), 'Director')]]

        full_name = response.xpath("//h1[@class='header-title pt-2 mb-0']/text()").extract_first()
        overallRating = response.xpath("//div[@class='text-center']/span/text()").extract_first()
        nationality = response.xpath("//p[@class='mb-0']/a/text()").getall()[0]
        school = response.xpath("//p[@class='text-light mb-0']/text()").getall()[2].split('\n')[1]

        player_obj['full_name'] = full_name
        player_obj['overallRating'] = overallRating
        player_obj['nationality'] = nationality
        player_obj['school'] = school

        

        yield player_obj


        
        

   