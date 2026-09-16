import { createCar, partInfo as accentParts } from './car.js';
import { createTruck, createAmbulance, createCrane, createExcavator, createMixer, createContainer } from './work-vehicles.js';

const definitions={
  body:['Thân xe','Phần khung chắc chắn nâng đỡ chiếc xe.'],
  cabin:['Ca-bin','Nơi bác tài ngồi điều khiển chiếc xe.'],
  doors:['Cửa xe','Mở cửa để bước vào trong xe.'],
  wheels:['Bánh xe','Các bánh xe lăn tròn để chiếc xe di chuyển.'],
  mirrors:['Gương chiếu hậu','Gương giúp bác tài quan sát phía sau.'],
  lights:['Đèn xe','Đèn giúp bác tài nhìn đường khi trời tối.'],
  engine:['Động cơ','Động cơ tạo sức mạnh cho chiếc xe.'],
  seats:['Ghế ngồi','Chỗ ngồi của bác tài và người đi cùng.'],
  steering:['Vô lăng','Bác tài xoay vô lăng để điều khiển hướng đi.'],
  joysticks:['Cần điều khiển','Bác lái máy dùng các cần để điều khiển máy xúc.'],
  'cargo-bed':['Thùng xe','Thùng xe dùng để chở hàng hóa.'],
  cargo:['Hàng hóa','Các kiện hàng đang được chở đến nơi nhận.'],
  'medical-room':['Khoang y tế','Nơi nhân viên y tế chăm sóc người bệnh.'],
  'rear-doors':['Cửa sau','Cửa sau mở để đưa cáng vào xe.'],
  beacon:['Đèn ưu tiên','Đèn báo cho mọi người biết xe đang làm nhiệm vụ.'],
  stretcher:['Cáng cứu thương','Chiếc cáng giúp đưa người bệnh lên xe.'],
  'first-aid':['Túi sơ cứu','Túi đựng dụng cụ sơ cứu.'],
  turntable:['Mâm xoay','Mâm xoay giúp phần phía trên quay sang các hướng.'],
  boom:['Cần nâng','Cần nâng vươn lên để làm việc trên cao.'],
  hydraulics:['Xi-lanh thủy lực','Xi-lanh đẩy và kéo để di chuyển cần.'],
  hook:['Móc cẩu','Móc cẩu dùng để nâng vật nặng.'],
  stabilizers:['Chân chống','Chân chống giúp xe đứng vững khi nâng đồ.'],
  tracks:['Bánh xích','Dải xích giúp máy di chuyển trên đất mềm.'],
  dipper:['Tay gầu','Tay gầu đưa gầu xúc đến chỗ cần đào.'],
  bucket:['Gầu xúc','Gầu xúc múc đất và cát.'],
  'drum-support':['Giá đỡ bồn','Giá đỡ giữ bồn trộn trên xe.'],
  drum:['Bồn trộn','Bồn quay để trộn bê tông bên trong.'],
  hopper:['Phễu nạp','Vật liệu đi qua phễu vào bồn trộn.'],
  chute:['Máng xả','Bê tông chảy ra theo máng xả.'],
  trailer:['Rơ-moóc','Rơ-moóc mang thùng hàng phía sau đầu kéo.'],
  container:['Thùng container','Thùng lớn bảo vệ hàng hóa trên đường đi.'],
  'container-doors':['Cửa container','Mở hai cánh cửa để đưa hàng vào thùng.'],
  coupling:['Mâm kéo','Mâm kéo nối đầu xe với rơ-moóc.'],
};
const colors=['#d5a573','#9caeca','#79b3ac','#e5a75e','#c794a5','#a4b978'];
const parts=ids=>ids.map((id,i)=>({id,name:definitions[id][0],description:definitions[id][1],english:'',color:colors[i%colors.length]}));
const base=['body','cabin','doors','wheels','lights','mirrors','engine','seats','steering'];
const entry=(id,name,label,color,colorName,factory,ids)=>({id,name,label,color,colorName,factory,parts:parts(ids),subtitle:'Mô hình đồ chơi',caption:`Mô hình ${name.toLocaleLowerCase('vi')} đồ chơi, được dựng riêng cho bé khám phá.`});
export const vehicles=[
  {id:'accent',name:'Ô tô con',label:'ACCENT',color:'#edf0ed',colorName:'Trắng ngọc',factory:createCar,parts:accentParts,subtitle:'Accent 2021',caption:'Mô hình cách điệu lấy cảm hứng từ Hyundai Accent 2021.'},
  entry('truck','Xe tải','CARGO','#6195b3','Xanh biển',createTruck,[...base,'cargo-bed','cargo']),
  entry('ambulance','Xe cứu thương','RESCUE','#edf1ed','Trắng · Cam',createAmbulance,[...base,'medical-room','rear-doors','beacon','stretcher','first-aid']),
  entry('crane','Xe cần cẩu','LIFT','#e9bc46','Vàng nắng',createCrane,[...base,'turntable','boom','hydraulics','hook','stabilizers']),
  entry('excavator','Máy xúc','DIG','#e7a842','Vàng cam',createExcavator,['body','tracks','cabin','doors','seats','joysticks','engine','turntable','boom','dipper','bucket','hydraulics','lights']),
  entry('mixer','Xe trộn bê tông','MIX','#689b8f','Xanh bạc hà',createMixer,[...base,'drum-support','drum','hopper','chute']),
  entry('container','Xe container','HAUL','#ca7958','Cam đất · Xanh',createContainer,[...base,'trailer','container','container-doors','coupling']),
];
// Parts travel this share of their authored delta, so the separated vehicle needs less room in the viewer.
export const separationSpread=.75;
export const vehicleById=id=>vehicles.find(vehicle=>vehicle.id===id);
export const allParts=[...new Map(vehicles.flatMap(v=>v.parts).map(p=>[p.id,p])).values()];
