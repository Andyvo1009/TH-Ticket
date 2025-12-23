
def remove_vietnamese_tones(text):
    if not text:
        return ""
    
    # Character mapping for Vietnamese tones
    char_map = {
        'a': 'àáạảãâầấậẩẫăằắặẳẵ',
        'e': 'èéẹẻẽêềếệểễ',
        'i': 'ìíịỉĩ',
        'o': 'òóọỏõôồốộổỗơờớợởỡ',
        'u': 'ùúụủũưừứựửữ',
        'y': 'ỳýỵỷỹ',
        'd': 'đ',
        'A': 'ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ',
        'E': 'ÈÉẸẺẼÊỀẾỆỂỄ',
        'I': 'ÌÍỊỈĨ',
        'O': 'ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ',
        'U': 'ÙÚỤỦŨƯỪỨỰỬỮ',
        'Y': 'ỲÝỴỶỸ',
        'D': 'Đ'
    }
    
    # Create reverse mapping
    tone_map = {}
    for base, variants in char_map.items():
        for variant in variants:
            tone_map[variant] = base
    
    # Replace each character
    result = []
    for char in text:
        if char in tone_map:
            result.append(tone_map[char])
        else:
            result.append(char)
    
    return ''.join(result)
