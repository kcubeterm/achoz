def extension_pattern_modifier(list_extension:list):
    prefix = r".+\."
    suffix = "$"
    out = []
    for ext in list_extension: 
        ext = prefix + str(ext) + suffix
        out.append(ext)
    return out
