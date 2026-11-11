import json, http.server, datetime
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def do_POST(self):
        b=json.loads(self.rfile.read(int(self.headers['Content-Length'])) or b'{}'); p=self.path
        assert self.headers.get('x-access-key')=='SEC' and b.get('appkey')=='APP'
        if p=='/openapi/login':
            d={"login_state":"1","token":"TOK"} if b.get('user_password')=='PW' else {"login_state":"0"}
            r={"result_code":"1","result_data":d}
        elif b.get('token')!='TOK': r={"result_code":"E00003","result_msg":"token invalid"}
        elif p=='/openapi/getPowerStationList':
            r={"result_code":"1","result_data":{"pageList":[{"ps_id":1234,"ps_name":"D Solar Ges","today_energy":{"value":"31.2","unit":"MWh"},"total_energy":{"value":"2.6","unit":"GWh"},"curr_power":{"value":"5400","unit":"kW"},"ps_status":1,"alarm_count":1}]}}
        elif p=='/openapi/getDevicePointsDayMonthYearDataList':
            s=datetime.date(int(b['start_time'][:4]),int(b['start_time'][4:6]),int(b['start_time'][6:])); e=datetime.date(int(b['end_time'][:4]),int(b['end_time'][4:6]),int(b['end_time'][6:]))
            L22=[];L18=[];L23=[]; d=s
            while d<=e:
                ts=d.strftime('%Y%m%d'); L22.append({"time_stamp":ts,"2":str(40000000+d.day*100000)}); L18.append({"time_stamp":ts,"2":"50000000"}); L23.append({"time_stamp":ts,"2":"82.5"}); d+=datetime.timedelta(days=1)
            r={"result_code":"1","result_data":{"1234_11_0_0":{"p83022":L22,"p83018":L18,"p83023":L23}}}
        elif p=='/openapi/getFaultAlarmInfo':
            r={"result_code":"1","result_data":{"pageList":[{"fault_code":"F1","fault_name":"Inverter 7 iletişim yok","fault_type":1,"fault_level":1,"process_status":8,"create_time":"2026-11-10 09:00","device_name":"INV-07"}]}}
        else: r={"result_code":"0","result_msg":"?"}
        o=json.dumps(r).encode(); self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(o))); self.end_headers(); self.wfile.write(o)
http.server.HTTPServer(('127.0.0.1',9999),H).serve_forever()
