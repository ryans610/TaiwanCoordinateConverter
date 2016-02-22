var TPCCConvert=(function namespace(){
	function TPCToT67(TPC){
		TPC=TPC.replace(/ /g,"").toUpperCase();
		var temp=objectClone(origins[TPC[0]]);
		if(TPC[0]==="Z"&&Number(TPC.substring(1,3))<51){	//金門
			temp.x+=80000;
		}
		temp.x+=Number(TPC.substring(1,3))*800;
		temp.y+=Number(TPC.substring(3,5))*500;
		if(TPC.length>=7){
			temp.x+=alphabet.indexOf(TPC[5])*100;
			temp.y+=alphabet.indexOf(TPC[6])*100;
		}
		if(TPC.length>=9){
			temp.x+=Number(TPC[7])*10;
			temp.y+=Number(TPC[8])*10;
		}
		if(TPC.length>=11){
			temp.x+=Number(TPC[9]);
			temp.y+=Number(TPC[10]);
		}
		return temp;
	}
	function T67ToTPC(T67){
		var T67=objectPrase(objectClone(T67));
		var temp="";
		var base;
		for(var p in origins){
			var x=origins[p].x;
			var y=origins[p].y;
			if(T67.x>=x&&T67.x<x+80000&&T67.y>=y&&T67.y<y+50000){
				temp+=p;
				base=origins[p];
				break;
			}
		}
		if(T67.x>=origins["Z"].x+80000&&T67.x<origins["Z"].x+160000
			&&T67.y>=origins["Z"].y&&T67.y<origins["Z"].y+50000){	//金門
			temp+="Z";
			base=origins["Z"];
			T67.x-=80000;
		}
		T67.x-=base.x;
		T67.y-=base.y;
		temp+=padLeft(Math.floor(T67.x/800).toString(),2,"0");
		temp+=padLeft(Math.floor(T67.y/500).toString(),2,"0");
		T67.x%=800;
		T67.y%=500;
		temp+=alphabet[Math.floor(T67.x/100)];
		temp+=alphabet[Math.floor(T67.y/100)];
		T67.x%=100;
		T67.y%=100;
		temp+=Math.floor(T67.x/10).toString();
		temp+=Math.floor(T67.y/10).toString();
		T67.x%=10;
		T67.y%=10;
		temp+=Math.floor(T67.x).toString();
		temp+=Math.floor(T67.y).toString();
		return temp;
	}
	function T67ToT97(T67){
		var T67=objectPrase(objectClone(T67));
		return {
			x:T67.x+parameter.T67T97.x+parameter.T67T97.A*T67.x+parameter.T67T97.B*T67.y,
			y:T67.y-parameter.T67T97.y+parameter.T67T97.A*T67.y+parameter.T67T97.B*T67.x
		};
	}
	function T97ToT67(T97){
		var T97=objectPrase(objectClone(T97));
		return {
			x:T97.x-parameter.T67T97.x-parameter.T67T97.A*T97.x-parameter.T67T97.B*T97.y,
			y:T97.y+parameter.T67T97.y-parameter.T67T97.A*T97.y-parameter.T67T97.B*T97.x
		};
	}
	function T97ToWGS84(T97){
		var T97=objectPrase(objectClone(T97));

		var a=parameter.T97WGS84.A;
		var b=parameter.T97WGS84.B;
		var e=parameter.T97WGS84.E;
		var e1=parameter.T97WGS84.E1;
		var e2=parameter.T97WGS84.E2;

		T97.x-=parameter.T97WGS84.DX;
		T97.y-=parameter.T97WGS84.DY;
		var M=T97.y/parameter.T97WGS84.K0;
		var mu=M/(a*(1-Math.pow(e,2)/4-3*Math.pow(e,4)/64-5*Math.pow(e,6)/256));
		var j1=(48*e1-27*Math.pow(e1,3))/32;
		var j2=(42*Math.pow(e1,2)-55*Math.pow(e1,4))/32;
		var j3=151*Math.pow(e1,3)/96;
		var j4=1097*Math.pow(e1,4)/512;
		var fp=mu+j1*Math.sin(2*mu)+j2*Math.sin(4*mu)+j3*Math.sin(6*mu)+j4*Math.sin(8*mu);
		var c=Math.pow(e2*Math.cos(fp),2);
		var t=Math.pow(Math.tan(fp),2);
		var r=a*(1-Math.pow(e,2))/Math.pow(1-Math.pow(e*Math.sin(fp),2),1.5);
		var n=a/Math.sqrt(1-Math.pow(e*Math.sin(fp),2));
		var d=T97.x/(n*parameter.T97WGS84.K0);
		j1=n*Math.tan(fp)/r;
		j2=Math.pow(d,2)/2;
		j3=(5+3*t+10*c-4*Math.pow(c,2)-9*e2)*Math.pow(d,4)/24;
		j4=(61+90*t+298*c+45*Math.pow(t,2)-3*Math.pow(c,2)-252*e2)*Math.pow(d,6)/720;
		var lat=(fp-j1*(j2-j3+j4))*180/Math.PI;
		j1=(1+2*t+c)*Math.pow(d,3)/6;
		j2=(5-2*c+28*t-3*Math.pow(c,2)+8*e2+24*Math.pow(t,2))*Math.pow(d,5)/120;
		var lon=(parameter.T97WGS84.LON0+(d-j1+j2)/Math.cos(fp))*180/Math.PI;
		return {
			lat:lat,
			lng:lon
		};
	}
	function WGS84ToT97(WGS84){
		var WGS84=objectPrase(objectClone(WGS84));
		var lon=WGS84.lng*Math.PI/180;
		var lat=WGS84.lat*Math.PI/180;

		var a=parameter.T97WGS84.A;
		var b=parameter.T97WGS84.B;
		var e=parameter.T97WGS84.E;
		var n=parameter.T97WGS84.E1;
		var e2=parameter.T97WGS84.E2;
		var k0=parameter.T97WGS84.K0;
		var nu=a/Math.sqrt(1-Math.pow(e*Math.sin(lat),2));

		var p1=a*(1-n+(Math.pow(n,2)-Math.pow(n,3))*5/4+(Math.pow(n,4)-Math.pow(n,5))*81/64);
		var p2=3*a*n*(1-n+(Math.pow(n,2)-Math.pow(n,3))*7/8+(Math.pow(n,4)-Math.pow(n,5))*55/64)/2;
		var p3=15*a*Math.pow(n,2)*(1-n+(Math.pow(n,2)-Math.pow(n,3))*3/4)/16;
		var p4=35*a*Math.pow(n,2)*(1-n+(Math.pow(n,2)-Math.pow(n,3))*11/16)/48;
		var p5=315*a*Math.pow(n,4)*(1-n)/51;
		var s=p1*lat-p2*Math.sin(lat*2)+p3*Math.sin(lat*4)-p4*Math.sin(lat*6)+p5*Math.sin(lat*8);

		p1=s*k0;
		p2=k0*nu*Math.sin(lat*2)/4;
		p3=k0*nu*Math.sin(lat)*Math.pow(Math.cos(lat),3)*(5-Math.pow(Math.tan(lat),2)+9*e2*Math.pow(Math.cos(lat),2)+4*Math.pow(e2,2)*Math.pow(Math.cos(lat),4))/24;
		var p=lon-parameter.T97WGS84.LON0;
		var y=p1+p2*Math.pow(p,2)+p3*Math.pow(p,4);

		p1=k0*nu*Math.cos(lat);
		p2=k0*nu*Math.pow(Math.cos(lat),3)*(1-Math.pow(Math.tan(lat),2)+e2*Math.pow(Math.cos(lat),2))/6;
		x=p1*p+p2*Math.pow(p,3)+parameter.T97WGS84.DX;

		return {
			x:x,
			y:y+7
		};
	}
	function TPCToT97(TPC){
		return T67ToT97(TPCToT67(TPC));
	}
	function T97ToTPC(T97){
		return T67ToTPC(T97ToT67(T97));
	}
	function T67ToWGS84(T67){
		return T97ToWGS84(T67ToT97(T67));
	}
	function WGS84ToT67(WGS84){
		return T97ToT67(WGS84ToT97(WGS84));
	}
	function TPCToWGS84(TPC){
		return T67ToWGS84(TPCToT67(TPC));
	}
	function WGS84ToTPC(WGS84){
		return T67ToTPC(WGS84ToT67(WGS84));
	}

	function objectPrase(obj){
		for(var p in obj){
			if(typeof(obj[p])==="string"){
				obj[p]=Number(obj[p].replace(/ /g,""));
			}
		}
		return obj;
	}
	function padLeft(str,length,paddingChar){
		paddingChar=paddingChar||" ";
		if(str.length>=length){
			return str;
		}
		else{
			return Array(length-str.length+1).join(paddingChar)+str;
		}
	}
    function objectClone(obj){
        return JSON.parse(JSON.stringify(obj));
    }

	var origins={
		A:{
			x:170000,
			y:2750000
		},
		B:{
			x:250000,
			y:2750000
		},
		C:{
			x:330000,
			y:2750000
		},
		D:{
			x:170000,
			y:2700000
		},
		E:{
			x:250000,
			y:2700000
		},
		F:{
			x:330000,
			y:2700000
		},
		G:{
			x:170000,
			y:2650000
		},
		H:{
			x:250000,
			y:2650000
		},
		I:{
			x:330000,
			y:2650000
		},
		J:{
			x:90000,
			y:2600000
		},
		K:{
			x:170000,
			y:2600000
		},
		L:{
			x:250000,
			y:2600000
		},
		M:{
			x:90000,
			y:2550000
		},
		N:{
			x:170000,
			y:2550000
		},
		O:{
			x:250000,
			y:2550000
		},
		P:{
			x:90000,
			y:2500000
		},
		Q:{
			x:170000,
			y:2500000
		},
		R:{
			x:250000,
			y:2500000
		},
		S:{	//馬祖
			x:10000,
			y:2894000
		},
		T:{
			x:170000,
			y:2450000
		},
		U:{
			x:250000,
			y:2450000
		},
		V:{
			x:170000,
			y:2400000
		},
		W:{	//蘭嶼
			x:250000,
			y:2400000
		},
		x:{	//澎湖
			x:10000,
			y:2614000
		},
		y:{	//澎湖
			x:10000,
			y:2564000
		},
		Z:{	//金門
			x:10000,
			y:2675800
		}
	};
	var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var parameter={
		T67T97:{
			A:0.00001549,
			B:0.000006521,
			x:807.8,
			y:248.6,
		},
		T97WGS84:{
			A:6378137,
			B:6356752.314245,
			LON0:121*Math.PI/180,
			K0:0.9999,
			DX:250000,
			DY:0,
		},
	};
	parameter.T97WGS84.E=Math.sqrt(1-Math.pow(parameter.T97WGS84.B/parameter.T97WGS84.A,2));
	parameter.T97WGS84.E1=(parameter.T97WGS84.A-parameter.T97WGS84.B);
	parameter.T97WGS84.E1/=parameter.T97WGS84.A+parameter.T97WGS84.B;
	parameter.T97WGS84.E2=Math.pow(parameter.T97WGS84.A/parameter.T97WGS84.B,2)-1;
	return {
		TPCToT67:TPCToT67,
		T67ToTPC:T67ToTPC,
		T67ToT97:T67ToT97,
		T97ToT67:T97ToT67,
		T97ToWGS84:T97ToWGS84,
		WGS84ToT97:WGS84ToT97,
		TPCToT97:TPCToT97,
		T97ToTPC:T97ToTPC,
		T67ToWGS84:T67ToWGS84,
		WGS84ToT67:WGS84ToT67,
		TPCToWGS84:TPCToWGS84,
		WGS84ToTPC:WGS84ToTPC,
	};
}());