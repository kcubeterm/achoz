def list2text(anylist:list, path: str,mode='w'):
    if len(anylist) == 0:
        return
    textfile = open(path,mode,encoding='utf8',errors='ignore')
    for item in anylist:
        textfile.write(item)
        textfile.write("\n")

    textfile.close()
    return 

def text2list(textfile:str):
    textfile = open(textfile)
    output_list = []
    for i in textfile.readlines():
        output_list.append(i[:-1])

    textfile.close()
    return output_list

