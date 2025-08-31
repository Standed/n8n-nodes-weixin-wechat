# -*- coding: utf-8 -*-
import json
from wxauto import WeChat

def get_contacts():
    try:
        wx = WeChat()
        
        # 获取联系人列表
        contacts = wx.GetAllFriends()
        
        contact_list = []
        for contact in contacts:
            contact_list.append({
                "id": contact,
                "name": contact,
                "alias": "",
                "type": "contact"
            })
        
        return {"success": True, "contacts": contact_list}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    result = get_contacts()
    print(json.dumps(result, ensure_ascii=False))