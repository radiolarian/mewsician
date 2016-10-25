import requests
from time import gmtime, strftime
from time import sleep 

def make_requests(key):
    url = "https://mewsician.herokuapp.com/api/"+key+"/demotime"
    return requests.put(url, data = {'date':  strftime("%Y-%m-%d %H:%M:%S", gmtime())})

while True:
    print make_requests('hi')
    sleep(5)