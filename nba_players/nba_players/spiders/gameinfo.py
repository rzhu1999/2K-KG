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
    #headers = {"USER-AGENT": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    #    "Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582"}
    def start_requests(self):
        urls = []
        with jsonlines.open("/Users/derekshi/Desktop/DSCI558/2K-KG/nba_players/nba_players/player.jsonlines", "r") as jsonl_f:
            for content in jsonl_f:
                link = "https://en.wikipedia.org/wiki/" + "_".join(content["full_name"].split())
                if content["full_name"].split()[-1] == 'Jr':
                    urls.append(link + '.')
                else:
                    urls.append(link)
        
        for url in urls:
            yield scrapy.Request(url = url, callback = self.parse)

        
    
    

    def parse(self, response):
        #players = []
        
        player_obj = NbaPlayerItem()
        #//li[span[contains(text(), 'Director')]]

        full_name = response.xpath("//span[@class='mw-page-title-main']/text()").extract_first()      
        nationality = response.xpath("//tr[contains(., 'Born')]/td/text()").getall()
        if len(nationality)<2:
            nationality = response.xpath("//tr[contains(., 'Nationality')]/td/text()").extract_first()
        else:
            nationality = nationality[1].strip(' ,')    
        college = response.xpath("//tr[contains(., 'College')]/td//a/text()").extract_first()
        highschool = response.xpath("//tr[contains(., 'High school')]/td//a/text()").extract_first()
        hometown = response.xpath("//tr[contains(., 'Born')]/td//a/text()").extract_first()

        player_obj['full_name'] = full_name
        player_obj['nationality'] = nationality
        player_obj['college'] = college
        player_obj['highschool'] = highschool
        player_obj['hometown'] = hometown

        

        yield player_obj


        
        

   