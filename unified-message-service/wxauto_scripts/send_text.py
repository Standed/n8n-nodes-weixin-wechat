# -*- coding: utf-8 -*-
import sys
import json
from wxauto import WeChat

def send_text_message(to_name, message, to_type='contact'):
    try:
        # 获取微信实例
        wx = WeChat()
        
        if to_type == 'contact':
            # 发送给联系人
            wx.SendMsg(msg=message, who=to_name)
        elif to_type == 'room':
            # 发送到群聊
            wx.SendMsg(msg=message, who=to_name)
        elif to_type == 'filehelper':
            # 发送到文件传输助手
            wx.SendMsg(msg=message, who='文件传输助手')
        
        return {"success": True, "message": "发送成功"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "error": "参数不足"}))
        sys.exit(1)
    
    to_type = sys.argv[1]
    to_name = sys.argv[2] if sys.argv[2] != 'null' else '文件传输助手'
    message = sys.argv[3]
    
    result = send_text_message(to_name, message, to_type)
    print(json.dumps(result, ensure_ascii=False))