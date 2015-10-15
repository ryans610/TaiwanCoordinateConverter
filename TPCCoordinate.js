var TPCCConvert=(function namespace(){
	function TPCToT67(TPC){
		TPC=TPC.replace(/ /g,"").toUpperCase();
		var temp=Object.create(origins[TPC[0]]);
		if(TPC[0]==="Z"&&Number(TPC.substring(1,3))<51){	//金門
			temp.X+=80000;
		}
		temp.X+=Number(TPC.substring(1,3))*800;
		temp.Y+=Number(TPC.substring(3,5))*500;
		if(TPC.length>=7){
			temp.X+=alphabet.indexOf(TPC[5])*100;
			temp.Y+=alphabet.indexOf(TPC[6])*100;
		}
		if(TPC.length>=9){
			temp.X+=Number(TPC[7])*10;
			temp.Y+=Number(TPC[8])*10;
		}
		if(TPC.length>=11){
			temp.X+=Number(TPC[9]);
			temp.Y+=Number(TPC[10]);
		}
		return temp;
	}
	function T67ToTPC(T67){
		var T67=objectPrase(Object.create(T67));
		var temp="";
		var base;
		for(var p in origins){
			var x=origins[p].X;
			var y=origins[p].Y;
			if(T67.X>=x&&T67.X<x+80000&&T67.Y>=y&&T67.Y<y+50000){
				temp+=p;
				base=origins[p];
				break;
			}
		}
		if(T67.X>=origins["Z"].X+80000&&T67.X<origins["Z"].X+160000
			&&T67.Y>=origins["Z"].Y&&T67.Y<origins["Z"].Y+50000){	//金門
			temp+="Z";
			base=origins["Z"];
			T67.X-=80000;
		}
		T67.X-=base.X;
		T67.Y-=base.Y;
		temp+=Math.floor(T67.X/800).toString();
		temp+=Math.floor(T67.Y/500).toString();
		T67.X%=800;
		T67.Y%=500;
		temp+=alphabet[Math.floor(T67.X/100)];
		temp+=alphabet[Math.floor(T67.Y/100)];
		T67.X%=100;
		T67.Y%=100;
		temp+=Math.floor(T67.X/10).toString();
		temp+=Math.floor(T67.Y/10).toString();
		T67.X%=10;
		T67.Y%=10;
		temp+=Math.floor(T67.X).toString();
		temp+=Math.floor(T67.Y).toString();
		return temp;
	}
	function T67ToT97(T67){
		var T67=objectPrase(Object.create(T67));
		return {
			X:T67.X+parameter.T67T97.X+parameter.T67T97.A*T67.X+parameter.T67T97.B*T67.Y,
			Y:T67.Y-parameter.T67T97.Y+parameter.T67T97.A*T67.Y+parameter.T67T97.B*T67.X
		};
	}
	function T97ToT67(T97){
		var T97=objectPrase(Object.create(T97));
		return {
			X:T97.X-parameter.T67T97.X-parameter.T67T97.A*T97.X-parameter.T67T97.B*T97.Y,
			Y:T97.Y+parameter.T67T97.Y-parameter.T67T97.A*T97.Y-parameter.T67T97.B*T97.X
		};
	}
	function T97ToWGS84(T97){
		var T97=objectPrase(Object.create(T97));

		var a=parameter.T97WGS84.A;
		var b=parameter.T97WGS84.B;
		var e=parameter.T97WGS84.E;
		var e1=parameter.T97WGS84.E1;
		var e2=parameter.T97WGS84.E2;

		T97.X-=parameter.T97WGS84.DX;
		T97.Y-=parameter.T97WGS84.DY;
		var M=T97.Y/parameter.T97WGS84.K0;
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
		var d=T97.X/(n*parameter.T97WGS84.K0);
		j1=n*Math.tan(fp)/r;
		j2=Math.pow(d,2)/2;
		j3=(5+3*t+10*c-4*Math.pow(c,2)-9*e2)*Math.pow(d,4)/24;
		j4=(61+90*t+298*c+45*Math.pow(t,2)-3*Math.pow(c,2)-252*e2)*Math.pow(d,6)/720;
		var lat=(fp-j1*(j2-j3+j4))*180/Math.PI;
		j1=(1+2*t+c)*Math.pow(d,3)/6;
		j2=(5-2*c+28*t-3*Math.pow(c,2)+8*e2+24*Math.pow(t,2))*Math.pow(d,5)/120;
		var lon=(parameter.T97WGS84.LON0+(d-j1+j2)/Math.cos(fp))*180/Math.PI;
		return {
			Lat:lat,
			Lon:lon
		};
	}
	function WGS84ToT97(WGS84){
		var WGS84=objectPrase(Object.create(WGS84));
		var lon=WGS84.Lon*Math.PI/180;
		var lat=WGS84.Lat*Math.PI/180;

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
			X:x,
			Y:y
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

	var origins={
		A:{
			X:170000,
			Y:2750000
		},
		B:{
			X:250000,
			Y:2750000
		},
		C:{
			X:330000,
			Y:2750000
		},
		D:{
			X:170000,
			Y:2700000
		},
		E:{
			X:250000,
			Y:2700000
		},
		F:{
			X:330000,
			Y:2700000
		},
		G:{
			X:170000,
			Y:2650000
		},
		H:{
			X:250000,
			Y:2650000
		},
		I:{
			X:330000,
			Y:2650000
		},
		J:{
			X:90000,
			Y:2600000
		},
		K:{
			X:170000,
			Y:2600000
		},
		L:{
			X:250000,
			Y:2600000
		},
		M:{
			X:90000,
			Y:2550000
		},
		N:{
			X:170000,
			Y:2550000
		},
		O:{
			X:250000,
			Y:2550000
		},
		P:{
			X:90000,
			Y:2500000
		},
		Q:{
			X:170000,
			Y:2500000
		},
		R:{
			X:250000,
			Y:2500000
		},
		S:{	//馬祖
			X:10000,
			Y:2894000
		},
		T:{
			X:170000,
			Y:2450000
		},
		U:{
			X:250000,
			Y:2450000
		},
		V:{
			X:170000,
			Y:2400000
		},
		W:{	//蘭嶼
			X:250000,
			Y:2400000
		},
		X:{	//澎湖
			X:10000,
			Y:2614000
		},
		Y:{	//澎湖
			X:10000,
			Y:2564000
		},
		Z:{	//金門
			X:10000,
			Y:2675800
		}
	};
	var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var parameter={
		T67T97:{
			A:0.00001549,
			B:0.000006521,
			X:807.8,
			Y:248.6,
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
	console.log(parameter);
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