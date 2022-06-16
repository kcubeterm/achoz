import string

stop_words = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]

def ascii_only_string(text):
    ascii_string = text.encode('ascii','ignore').decode()
    return ascii_string

def remove_punc(text):
    no_punc_text = text.translate(str.maketrans('', '', string.punctuation))
    return no_punc_text

def extra_space(text):
    return " ".join(text.split())

def change_to_lower(text):
    return text.lower()
def rm_stop_wrd(text):
    text_token = text.split()
    filter_text = [word for word in text_token if word not in stop_words]
    return ' '.join(filter_text)

def init(text):
    clean_text = rm_stop_wrd(change_to_lower(extra_space(remove_punc(ascii_only_string(text)))))
    return clean_text


