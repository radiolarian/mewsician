import requests
from time import gmtime, strftime
from time import sleep 
import random

def make_requests():
    url = "https://mewsician.herokuapp.com/demotime"
    return requests.put(url, data = {'data':  "Hello Mewsician, here's a random number: " + str(random.randint(0,100)) })

while True:
    print make_requests()
    sleep(5)