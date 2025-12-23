
import redis
import os
from dotenv import load_dotenv
load_dotenv()

r = redis.Redis(
    host='redis-18183.c1.ap-southeast-1-1.ec2.cloud.redislabs.com',
    port=18183,
    decode_responses=True,
    username="default",
    password=os.getenv("REDIS_PASSWORD"),
)


def cache_set(key, value, ex=None):
    r.set(name=key, value=value, ex=ex)


def cache_get(key):
    return r.get(name=key)


def cache_delete(key):
    r.delete(key)
