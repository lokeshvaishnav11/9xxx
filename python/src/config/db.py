from pymongo import MongoClient
import certifi
# dbClient = MongoClient('mongodb://159.223.245.11:27036/metablock?directConnection=true&serverSelectionTimeoutMS=2000&replicaSet=rs0')

# dbClient = MongoClient('mongodb+srv://infayou:rahul1234@cluster0.zbf0n.mongodb.net/infa?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true')
# dbClient = MongoClient("mongodb://admin:StrongPasswordHere@69.62.123.205:27017/infa?authSource=admin&retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true")
dbClient = MongoClient("mongodb://admin:9xbro%408824@69.62.123.205:27017/infa?retryWrites=true&authSource=admin&replicaSet=rs0")

print(dbClient)
db = dbClient.get_database()
print(db)
Balances = db['balances']  # collection object
Market = db['markets']
Bet = db['bets']
Match = db['matches']
User = db['users']
BetLock = db['betlocks']
CasinoMatch = db['casinomatches']
Lenah = db['lenahs']
Denah = db['denahs']

#data = CasinoMatch.find_one({"match_id":12})
#print(data)
