

list1 = ['a', 'b', 'c', 'd']
 
match list1:
    case ['e','f'] : print("e,f present")
    case ['a','b','c','d'] : print("a,b,c,d present")

# def kuchbhi(file):
#     match file:
#         case "audio":
#             return 'audio hai bc'
#         case "video":
#             return 'video hai bc'
#         case default:
#             return 'kuch nhi hai bc'

# kuchbhi("audio")
