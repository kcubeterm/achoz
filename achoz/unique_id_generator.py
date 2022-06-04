from hashlib import md5

def uniqueid(anystring):
    return md5(anystring.encode()).hexdigest()[:12]

