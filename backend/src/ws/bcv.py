URL = "https://alcambio.app/"

from requests import get
from bs4 import BeautifulSoup

def main():
    response = get(url=URL)
    soup = BeautifulSoup(response.content, "html.parser")
    print(soup.prettify())
    c = soup.find_all(class_="d-flex justify-center text-money")
    print(c)
    

if __name__ == '__main__':
    main()
    