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

        full_name = response.xpath("//div[@class = 'player-fullname']/text()").extract_first().strip("\n").strip("\t")
        team = response.xpath("//div[@class = 'player-team']/a/text()").strip("\n").strip("\t")
        position = response.xpath("//div[@class = 'player-bio-text']/span[@class = 'player-bio-text-line']/span[@class='player-bio-text-line-value']/text()").getall()[0]
        born = response.xpath("//div[@class = 'player-bio-text']/span[@class = 'player-bio-text-line']/span[@class='player-bio-text-line-value']/text()").getall()[1]
        height = response.xpath("//div[@class = 'player-bio-text']/span[@class = 'player-bio-text-line']/span[@class='player-bio-text-line-value']/text()").getall()[2]
        weight = response.xpath("//div[@class = 'player-bio-text']/span[@class = 'player-bio-text-line']/span[@class='player-bio-text-line-value']/text()").getall()[3]
        salary = response.xpath("//div[@class = 'player-bio-text']/span[@class = 'player-bio-text-line']/span[@class='player-bio-text-line-value']/text()").getall()[4]
        avatar_link = response.xpath("//div[@class = 'player-headshot']/img/@src").extract_first()
        player_obj['full_name'] = full_name
        player_obj['team'] = team
        player_obj['position'] = position
        player_obj['born'] = born
        player_obj['height'] = height
        player_obj['weight'] = weight
        player_obj['salary'] = salary
        player_obj['avatar_link'] = avatar_link
        

        yield player_obj


        
        

   