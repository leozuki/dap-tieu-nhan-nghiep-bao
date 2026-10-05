/* Kịch bản: toàn bộ chữ trong game nằm ở đây để biên kịch sửa mà không đụng code.
   ~~chữ~~ = chữ bị gạch khi hiển thị. Mỗi hình nhân: 3 lượt (Bạn kể / Họ kể / Bằng chứng), mỗi lượt 2 lời thì thầm. */
(function (root) {
  const DOLLS = [
    {
      id: 'batam',
      look: { tiers: ['v3/batam/clean', 'v3/batam/wrinkled', 'v3/batam/edited'], base: 'v3/batam/clean', run: ['v3/batam/dodge1', 'v3/batam/dodge2', 'v3/batam/dodge3', 'v3/batam/dodge4'], hit: ['v3/batam/hit1', 'v3/batam/hit2', 'v3/batam/hit4'], tele: 'v3/batam/wobble', taunt: 'v3/batam/taunt', happy: 'v3/batam/dash', angry: 'v3/batam/hurt', hurt: 'v3/batam/hurt', cry: 'v3/batam/hurt', talk: 'v3/batam/stand', ko: 'v3/batam/ko', duck: 'v3/batam/duck', sad: 'v3/batam/wrinkled', face: 'v3/batam/f1', faceAngry: 'v3/batam/f5', faceScared: 'v3/batam/f4', faceCry: 'v3/batam/f6', faces: ['v3/batam/f1', 'v3/batam/f2', 'v3/batam/f3', 'v3/batam/f4', 'v3/batam/f5', 'v3/batam/f6', 'v3/batam/f7', 'v3/batam/f8'] }, name: 'Bà Tư', role: 'bà tám đầu hẻm', dodge: 'side',
      shirt: '#8e5bb5', shirt2: '#6a3f8f', accent: '#f5d36e', hair: 'bun',
      intro: 'Đi khắp hẻm nói tôi điên.',
      vows: [
        'Con khấn đập cái miệng Bà Tư. Cái miệng đi khắp hẻm nói con điên.',
        'Con khấn đập Bà Tư. Bà ~~nói con điên~~ nói con… ốm? Không. Bà nói con điên.',
        'Con khấn… con không nhớ bà nói gì nữa. Cứ đập đi.'
      ],
      taunts: ['Ui da! Đập nhẹ thôi bà già rồi!', 'Hẻm này ai cũng biết hết á nghen!', 'Nói thiệt mất lòng mà!', 'Trượt rồi, hí hí!'],
      whispers: [
        ['Bà có nói con điên đâu…', 'Bà nói con ốm. Ba ngày con không mở cửa.'],
        ['Bà gõ cửa hoài, con không trả lời.', 'Bà gọi cho mẹ con. Nếu vậy là sai, bà xin lỗi.'],
        ['Cặp lồng cháo bà để trước cửa, con có ăn không?', 'Con gầy quá, Vy à.']
      ],
      frags: [
        { kind: 'Bạn kể', text: 'Bà Tư bán vé số đầu hẻm 27, chỗ tôi thuê phòng 6. Bà đứng giữa hẻm kể cho ai cũng nghe: "Con nhỏ phòng 6 điên rồi." Từ đó ai đi ngang cũng nhìn tôi.' },
        { kind: 'Họ kể', text: 'Bà Tư không nói "điên". Bà nói "ốm". Bà gọi cho mẹ tôi sau ba ngày tôi không mở cửa.' },
        { kind: 'Bằng chứng', item: 'note', title: 'Giấy nhắn dán cửa', text: '"Vy ơi, cháo trong cặp lồng, ăn đi con. — Bà Tư". Mép giấy đã ố vì nắng.' }
      ],
      end: 'Người mang ảnh Vy đi đăng báo tìm người là Bà Tư. Bà đóng tiền đăng báo bằng tiền bán vé số ba ngày.'
    },
    {
      id: 'sep',
      look: { tiers: ['v3/sep/clean', 'v3/sep/wrinkled', 'v3/sep/edited'], base: 'v3/sep/clean', run: ['v3/sep/dodge1', 'v3/sep/dodge2', 'v3/sep/dodge3', 'v3/sep/dodge4'], hit: ['v3/sep/hit1', 'v3/sep/hit2', 'v3/sep/hit4'], tele: 'v3/sep/wobble', taunt: 'v3/sep/taunt', happy: 'v3/sep/dash', angry: 'v3/sep/hurt', hurt: 'v3/sep/hurt', cry: 'v3/sep/hurt', talk: 'v3/sep/stand', ko: 'v3/sep/ko', duck: 'v3/sep/duck', sad: 'v3/sep/wrinkled', face: 'v3/sep/f1', faceAngry: 'v3/sep/f5', faceScared: 'v3/sep/f4', faceCry: 'v3/sep/f6', faces: ['v3/sep/f1', 'v3/sep/f2', 'v3/sep/f3', 'v3/sep/f4', 'v3/sep/f5', 'v3/sep/f6', 'v3/sep/f7', 'v3/sep/f8'] }, name: 'Anh Khải', role: 'sếp khó tính', dodge: 'duck',
      shirt: '#3d6fb0', shirt2: '#24497a', accent: '#c8261f', hair: 'part',
      intro: 'Đuổi tôi trước mặt cả phòng.',
      vows: [
        'Con khấn đập Anh Khải. Kẻ đuổi con trước mặt cả phòng.',
        'Con khấn đập Anh Khải. Trước mặt ~~cả phòng~~… trong phòng họp. Cửa đóng. Vẫn là đuổi.',
        'Con khấn đập… anh ấy đã nói gì nhỉ. "Nghỉ" hay "nghỉ việc"?'
      ],
      taunts: ['Deadline đâu? Đập cũng phải có KPI!', 'Họp! Họp ngay!', 'Em đập sai quy trình rồi!', 'Hụt! Trừ lương!'],
      whispers: [
        ['Anh không đuổi em.', 'Anh nói nhỏ thôi mà. Phòng họp, cửa đóng.'],
        ['Nghỉ phép có lương. Em nghỉ cho khỏe.', 'Anh chở em đi khám, em nhớ không?'],
        ['Bàn của em anh vẫn để nguyên.', 'Cây xương rồng anh tưới mỗi thứ Hai.']
      ],
      frags: [
        { kind: 'Bạn kể', text: 'Anh Khải là trưởng phòng của tôi. Anh gọi tôi lên giữa giờ, nói to cho cả phòng nghe: "Em nghỉ đi." Ai cũng quay lại nhìn.' },
        { kind: 'Họ kể', text: 'Cửa phòng họp đóng. Anh nói nhỏ. "Em nghỉ phép đi, có lương." Rồi anh chở tôi đến phòng khám.' },
        { kind: 'Bằng chứng', item: 'leave', title: 'Giấy duyệt nghỉ phép', text: 'Nghỉ phép có hưởng lương, 30 ngày. Kẹp kèm đơn thuốc: "Tái khám ngày 15". Ngày 15 đã qua lâu rồi.' }
      ],
      end: 'Bàn làm việc của Vy vẫn để nguyên. Cây xương rồng vẫn xanh. Anh Khải chưa tuyển ai vào chỗ đó.'
    },
    {
      id: 'dongnghiep',
      look: { tiers: ['v3/dongnghiep/clean', 'v3/dongnghiep/wrinkled', 'v3/dongnghiep/edited'], base: 'v3/dongnghiep/clean', run: ['v3/dongnghiep/dodge1', 'v3/dongnghiep/dodge2', 'v3/dongnghiep/dodge3', 'v3/dongnghiep/dodge4'], hit: ['v3/dongnghiep/hit1', 'v3/dongnghiep/hit2', 'v3/dongnghiep/hit4'], tele: 'v3/dongnghiep/wobble', taunt: 'v3/dongnghiep/taunt', happy: 'v3/dongnghiep/dash', angry: 'v3/dongnghiep/hurt', hurt: 'v3/dongnghiep/hurt', cry: 'v3/dongnghiep/hurt', talk: 'v3/dongnghiep/stand', ko: 'v3/dongnghiep/ko', duck: 'v3/dongnghiep/duck', sad: 'v3/dongnghiep/wrinkled', face: 'v3/dongnghiep/f1', faceAngry: 'v3/dongnghiep/f5', faceScared: 'v3/dongnghiep/f4', faceCry: 'v3/dongnghiep/f6', faces: ['v3/dongnghiep/f1', 'v3/dongnghiep/f2', 'v3/dongnghiep/f3', 'v3/dongnghiep/f4', 'v3/dongnghiep/f5', 'v3/dongnghiep/f6', 'v3/dongnghiep/f7', 'v3/dongnghiep/f8'] }, name: 'Phát', role: 'đồng nghiệp hớt công', dodge: 'shield',
      shirt: '#e9b73a', shirt2: '#b98a22', accent: '#3b1a12', hair: 'glasses',
      intro: 'Lấy dự án, đứng tên một mình.',
      vows: [
        'Con khấn đập thằng Phát. Đứa cướp dự án của con, đứng tên một mình.',
        'Con khấn đập Phát. Nó đứng tên ~~một mình~~… sau tên con? Không. Một mình.',
        'Con khấn đập Phát. Ai gạch tên con trên trang bìa vậy?'
      ],
      taunts: ['Ý tưởng hay mà, em xin nha!', 'Slide này em làm đó!', 'Che hồ sơ cái đã!', 'Trượt rồi chị ơi!'],
      whispers: [
        ['Chị nghỉ, em làm nốt thôi.', 'Tên chị em để đầu tiên mà.'],
        ['Ai gạch tên chị vậy?', 'Nét bút đỏ đó… giống chữ chị.'],
        ['Thưởng dự án em giữ hộ.', 'Phong bì chưa mở. Đợi chị về.']
      ],
      frags: [
        { kind: 'Bạn kể', text: 'Phát ngồi bàn bên cạnh tôi. Dự án đó tôi làm ba tháng. Buổi thuyết trình cuối, Phát đứng lên nhận lời khen, trên màn hình chỉ có tên nó.' },
        { kind: 'Họ kể', text: 'Tôi nghỉ giữa chừng. Phát làm nốt. Trên trang bìa, tên tôi đứng đầu. Tôi không có mặt để thấy.' },
        { kind: 'Bằng chứng', item: 'slide', title: 'Trang bìa thuyết trình', text: '"Thực hiện: Trần Hạ Vy, Lê Tấn Phát". Tên Vy bị gạch bằng bút đỏ, cùng loại bút trong túi áo tôi.' }
      ],
      end: 'Phát giữ phong bì thưởng dự án trong ngăn kéo, ghi ngoài bìa: "Của chị Vy".'
    },
    {
      id: 'nguoiquen',
      look: { tiers: ['v3/nguoiquen/clean', 'v3/nguoiquen/wrinkled', 'v3/nguoiquen/edited'], base: 'v3/nguoiquen/clean', run: ['v3/nguoiquen/dodge1', 'v3/nguoiquen/dodge2', 'v3/nguoiquen/dodge3', 'v3/nguoiquen/dodge4'], hit: ['v3/nguoiquen/hit1', 'v3/nguoiquen/hit2', 'v3/nguoiquen/hit4'], tele: 'v3/nguoiquen/wobble', taunt: 'v3/nguoiquen/taunt', happy: 'v3/nguoiquen/dash', angry: 'v3/nguoiquen/hurt', hurt: 'v3/nguoiquen/hurt', cry: 'v3/nguoiquen/hurt', talk: 'v3/nguoiquen/stand', ko: 'v3/nguoiquen/ko', duck: 'v3/nguoiquen/duck', sad: 'v3/nguoiquen/wrinkled', face: 'v3/nguoiquen/f1', faceAngry: 'v3/nguoiquen/f5', faceScared: 'v3/nguoiquen/f4', faceCry: 'v3/nguoiquen/f6', faces: ['v3/nguoiquen/f1', 'v3/nguoiquen/f2', 'v3/nguoiquen/f3', 'v3/nguoiquen/f4', 'v3/nguoiquen/f5', 'v3/nguoiquen/f6', 'v3/nguoiquen/f7', 'v3/nguoiquen/f8'] }, name: 'Diễm', role: 'người quen vay tiền', dodge: 'fade',
      shirt: '#2f8f83', shirt2: '#1f6259', accent: '#fbf6ea', hair: 'cap',
      intro: 'Vay tiền rồi biến mất.',
      vows: [
        'Con khấn đập con Diễm. Vay tiền rồi biến mất.',
        'Con khấn đập Diễm. Nó ~~vay~~… đưa? Tiền nằm trong túi con. Vậy ai vay ai?',
        'Con khấn đập Diễm vì… vì nó biến mất. Hay con biến mất?'
      ],
      taunts: ['Mai tớ trả, thiệt mà!', 'Ơ, tớ đi đây!', 'Đập trượt rồi kìa!', 'Ủa ai vay ai?'],
      whispers: [
        ['Tiền đó tớ đưa cậu mà.', 'Mua vé tàu về quê, nhớ không?'],
        ['Cậu hứa tới nơi sẽ gọi.', 'Tớ gọi cả trăm cuộc. Máy cậu tắt.'],
        ['Tớ ra ga mỗi Chủ nhật.', 'Ảnh cậu tớ dán khắp ga rồi.']
      ],
      frags: [
        { kind: 'Bạn kể', text: 'Diễm là bạn thân của tôi từ hồi đại học. Nó mượn tôi một khoản lớn, hứa cuối tháng trả. Rồi nó chặn số, biến mất.' },
        { kind: 'Họ kể', text: 'Diễm đưa tôi tiền, không phải mượn. "Mua vé về quê đi, tới nơi gọi tớ." Tôi không gọi.' },
        { kind: 'Bằng chứng', item: 'ticket', title: 'Vé tàu', text: 'Sài Gòn → Quảng Ngãi. Ghế 14, toa 6. Vé chưa bấm lỗ. Chuyến tàu đã đi từ 41 ngày trước.' }
      ],
      end: 'Mỗi Chủ nhật Diễm ra ga, dán lại những tờ ảnh bị mưa làm bong.'
    },
    {
      id: 'traxanh',
      look: { tiers: ['v3/traxanh/clean', 'v3/traxanh/wrinkled', 'v3/traxanh/edited'], base: 'v3/traxanh/clean', run: ['v3/traxanh/dodge1', 'v3/traxanh/dodge2', 'v3/traxanh/dodge3', 'v3/traxanh/dodge4'], hit: ['v3/traxanh/hit1', 'v3/traxanh/hit2', 'v3/traxanh/hit4'], tele: 'v3/traxanh/wobble', taunt: 'v3/traxanh/taunt', happy: 'v3/traxanh/dash', angry: 'v3/traxanh/hurt', hurt: 'v3/traxanh/hurt', cry: 'v3/traxanh/hurt', talk: 'v3/traxanh/stand', ko: 'v3/traxanh/ko', duck: 'v3/traxanh/duck', sad: 'v3/traxanh/wrinkled', face: 'v3/traxanh/f1', faceAngry: 'v3/traxanh/f5', faceScared: 'v3/traxanh/f4', faceCry: 'v3/traxanh/f6', faces: ['v3/traxanh/f1', 'v3/traxanh/f2', 'v3/traxanh/f3', 'v3/traxanh/f4', 'v3/traxanh/f5', 'v3/traxanh/f6', 'v3/traxanh/f7', 'v3/traxanh/f8'] }, name: 'My', role: 'trà xanh cùng phòng trọ', dodge: 'side',
      shirt: '#7fb89a', shirt2: '#4f8a6a', accent: '#f5d36e', hair: 'bun',
      intro: 'Giả nai trước mặt mọi người, rồi cướp người yêu tôi.',
      vows: [
        'Con khấn đập con My. Mặt hiền như nai, sau lưng thì cướp người yêu con.',
        'Con khấn đập My. Nó ~~cướp~~… nó gửi con ảnh tin nhắn của anh ta? Không. Nó cướp.',
        'Con khấn đập My. Tại sao người duy nhất nói thật với con lại là người con ghét nhất?'
      ],
      taunts: ['Ui, chị làm gì vậy, em sợ á!', 'Em có làm gì đâu nè~', 'Hụt rồi chị ơi, hihi!', 'Đừng nhìn em như vậy mà!'],
      whispers: [
        ['Anh ấy nhắn em trước, chị.', 'Em chụp màn hình gửi chị ngay đêm đó.'],
        ['Chị chặn em, em tưởng chị giận anh ta.', 'Em không thích anh ta. Em sợ chị bị lừa.'],
        ['Phòng 6 em vẫn đóng tiền giúp chị.', 'Đồ của chị em để y nguyên, kể cả cái nơ.']
      ],
      frags: [
        { kind: 'Bạn kể', text: 'My ở phòng 7, sát vách phòng tôi, lúc nào cũng cười hiền. Rồi một đêm, người yêu tôi nhắn tin cho nó. Ai cũng bảo nó "trà xanh".' },
        { kind: 'Họ kể', text: 'Người nhắn trước là anh ta. My chụp màn hình gửi tôi ngay đêm đó. Tôi chặn My, không chặn anh ta.' },
        { kind: 'Bằng chứng', item: 'note', title: 'Ảnh chụp màn hình in ra', text: 'Tin nhắn lúc 1 giờ sáng từ người yêu cũ của Vy gửi My. Bên dưới, My trả lời: "Anh nhắn nhầm người rồi. Em gửi chị Vy xem." Mép giấy có vết gấp, như từng bị vò rồi vuốt phẳng.' }
      ],
      end: 'My vẫn đóng tiền phòng 6 hai tháng nay. Cái nơ xanh Vy hay đeo, My cài lên tóc mình để khỏi lạc mất.'
    }
  ];

  /* Phần mở đầu: giới thiệu bối cảnh, KHÔNG lộ twist (người chơi chính là Vy).
     art: alley | dolls | altar | slipper | night. {accuse} = danh sách lời buộc tội, lấy tên hiện tại của hình nhân (kể cả tên tự đặt). */
  const INTRO = [
    { art: 'alley', lines: ['Sài Gòn, tiết Kinh Trập.', 'Người xưa nói đây là lúc sâu bọ thức giấc. Tiểu nhân cũng vậy.'] },
    { art: 'dolls', lines: ['Tháng này là tháng tệ nhất đời bạn.', '{accuse}'] },
    { art: 'altar', lines: ['Cuối hẻm 27 có một bà thầy ngồi bên cái bàn đỏ.', 'Con kể tên ai, bà làm hình nhân người đó. Bày mâm, khấn, cầm dép lên mà đập cho hả giận.'] },
    { art: 'slipper', lines: ['Bà thầy dặn hai điều.', 'Một: đập bừa thì <b>nghiệp quật</b>.', 'Hai: có lúc tiểu nhân sẽ thì thầm. Muốn nghe thì phải <b>dừng tay</b>.'] },
    { art: 'night', dark: true, lines: ['Bạn mang theo năm cái tên.', 'Và một chiếc dép xanh.'] }
  ];

  /* Lời bà thầy sau mỗi lượt (lượt 1 / 2 / 3), hiện ở màn kết quả cùng mảnh ký ức mới.
     Lượt 1: bà đồng tình. Lượt 2: bà thấy lời con kể và lời hình nhân vênh nhau. Lượt 3: bà hỏi thẳng.
     Bà thầy là giọng của chính Vy (lộ ở cảnh 07), nên bà biết nhiều hơn mức một người lạ nên biết. */
  const THAY = {
    batam: [
      'Bà Tư bán vé số đó hả? Ừ, cái miệng bà ấy to thật. Mai đem lại đây, bà xem nó còn nói gì.',
      'Lạ ha. Hình nhân của bà không biết nói dối. Con nói Bà Tư bảo con điên, còn nó nói nó bảo con ốm. Ai đúng?',
      'Người đi nói xấu con mà nấu cháo để trước cửa cho con ăn à? Ba ngày đó con ở trong phòng làm gì?'
    ],
    sep: [
      'Sếp mà đuổi người trước mặt cả phòng thì đáng lắm. Đập cho nó nhớ.',
      'Phòng họp, cửa đóng, nói nhỏ. Con nhớ chỗ đó rõ quá ha. Vậy "cả phòng" ở đâu ra?',
      'Nghỉ phép có lương, còn kẹp đơn thuốc. Ngày 15 con có đi tái khám không?'
    ],
    dongnghiep: [
      'Cướp công người khác thì đập. Hợp lý.',
      'Nó nói tên con đứng đầu trang bìa. Vậy ai gạch tên con đi?',
      'Bút đỏ… Con đưa bà coi cây bút đỏ trong túi áo con đi.'
    ],
    nguoiquen: [
      'Vay không trả, còn chặn số. Đập.',
      'Nó nói nó đưa tiền cho con mua vé về quê, không phải cho vay. Tiền đó con để đâu rồi?',
      'Vé chưa bấm lỗ. Con chưa từng lên chuyến tàu đó, phải không con?'
    ],
    traxanh: [
      'Giật bồ bạn thì đập cho thật đau.',
      'Nó gửi con tin nhắn của thằng kia ngay trong đêm. Đứa giật bồ ai lại làm vậy?',
      'Người duy nhất nói thật với con, con lại đem ra đập trước.'
    ]
  };
  DOLLS.forEach(d => { d.thay = THAY[d.id]; });

  const SCENES = {
    s01: {
      title: 'Bước vào hẻm',
      npc: {
        name: 'Bà bán trái cây', img: 'fruit-seller',
        line: 'Tìm bà thầy hả? Đi hết hẻm, thấy cái bàn đỏ thì quẹo vô. Mà… tính đập ai đó?',
        choices: [
          { t: 'Dạ, cho con hỏi đường thôi.', reply: 'Hỏi đường thì ai cũng nói vậy. Đi đi con, bàn đỏ cuối hẻm.' },
          { t: 'Sao cô biết con tới đập?', reply: 'Ai vô hẻm này mà chẳng ôm theo mấy cái tên. Mà con… cô thấy con đi ngang hoài mà.' }
        ]
      },
      text: 'Hẻm 27. Nắng chiều xiên qua cửa sắt kéo. Trên chiếc bàn đỏ là năm hình nhân giấy, sạch tinh, tên ai nấy dán ngay ngắn.\n\nĐập tiểu nhân thôi mà. Ai chẳng có vài người đáng ghét.' },
    s03: { title: 'Lời kể bị sửa', text: 'Hình nhân vừa đập nằm lệch trên bàn, giấy nhăn nhúm. Dải giấy ghi tên bị ai gạch một đường, rồi viết đè lên.\n\nBà thầy vuốt phẳng nó: "Hình nhân của bà dán bằng chính lời khấn của con. Đập vào là lời khấn rách ra, lộ cái bên dưới."\n\n"Lúc nó thì thầm, con thử dừng tay mà nghe. Mỗi người con đập đủ ba lần: lần đầu nghe con kể, lần hai nghe nó kể, lần ba sẽ thấy bằng chứng."\n\nBóng chiếc dép đổ dài trên bàn.' },
    s04: { title: 'Khoảng dừng', text: 'Hình nhân đang nói gì đó.\n\nNếu dừng tay, bạn sẽ nghe được.' },
    s05: {
      title: 'Người trên báo',
      text: 'Bàn đỏ cập kênh. Bạn cúi xuống kê lại chân bàn, thấy một tờ báo cũ gấp làm tư lót bên dưới.',
      paper: 'TÌM NGƯỜI THÂN\n\nChị TRẦN HẠ VY, 26 tuổi, rời nhà trọ hẻm 27 đã 42 ngày. Khi đi mặc áo đỏ, mang dép xanh.\n\nAi biết tin xin báo cho gia đình. Xin cảm ơn bà con.',
      after: 'Ảnh trong báo nhòe nước mưa. Nhưng nốt ruồi dưới mắt trái thì rõ, giống hệt nốt ruồi trên mặt mấy hình nhân.\n\nBà thầy rút tờ báo khỏi tay bạn, gấp lại, nhét về chỗ cũ: "Báo cũ thôi con. Đập tiếp đi."'
    },
    s06: {
      title: 'Trong thùng rác',
      text: 'Thùng rác cạnh bàn đầy giấy đỏ vụn. Bà thầy dặn đừng lục. Bạn vẫn lục, và thấy ba thứ dưới đáy.',
      items: [
        { icon: 'receipt', name: 'Hóa đơn', text: 'Sơn đỏ × 4 hộp. Bút lông đỏ × 1.' },
        { icon: 'pills', name: 'Hộp thuốc', text: 'Còn nguyên vỉ. Chưa uống viên nào.' },
        { icon: 'ticket', name: 'Vé tàu', text: 'Chưa bấm lỗ.' }
      ],
      after: 'Ai đã mua sơn đỏ, viết lời khấn, dán năm hình nhân này?\n\nBạn lật mặt sau một hình nhân: lời buộc tội viết bằng bút đỏ. Cùng một nét chữ với hóa đơn, với tên ghi trên vé tàu.\n\nBạn quay sang hỏi bà thầy. Bà không trả lời.'
    },
    s07: {
      title: 'Một giọng, năm miệng',
      lines: [
        'Năm hình nhân rách nát cùng ngẩng lên. Năm cái miệng mở ra cùng lúc, nhưng chỉ có một giọng.',
        '"Tôi nói. Tôi viết. Tôi đập."',
        'Bạn quay sang tìm bà thầy. Cái ghế nhựa bên cạnh trống trơn, phủ một lớp bụi.',
        'Chưa từng có bà thầy nào. Giọng bà là giọng bạn, tự hỏi rồi tự trả lời.',
        'Trên cửa sắt kéo, nắng chiều in bóng một cô gái mặc áo đỏ, tay cầm chiếc dép xanh. Cô ấy đứng ngay chỗ bạn đứng.',
        'Tên cô là Trần Hạ Vy, phòng 6, hẻm 27. Bốn mươi hai ngày trước, Vy bỏ thuốc, khóa cửa, rồi lặng lẽ biến khỏi cuộc sống của mọi người.',
        'Vy tự mua sơn, tự làm hình nhân, tự viết lời buộc tội lên lưng từng người.',
        'Những người Vy đem ra đập là những người đang đi tìm Vy.'
      ]
    },
    s08: { title: 'Tên cuối cùng', text: 'Trên bàn còn lại chiếc dép, cây bút đỏ, và hình nhân thứ sáu: giấy trắng, chưa có mặt, chưa có tên. Hình nhân cho người cuối cùng Vy còn giận.' }
  };

  const ENDINGS = {
    A: { title: 'Hẻm không tên', lines: ['Bạn cầm dép lên.', 'Cửa sắt kéo xuống. Tờ báo dưới bàn vàng thêm một chút.', '"…rời nhà trọ hẻm 27 đã 43 ngày."', 'Ngày mai, sẽ lại có năm hình nhân mới.'] },
    B: { title: 'Im tiếng', lines: ['Bạn đặt dép xuống.', 'Các hình nhân im lặng. Hẻm im lặng.', 'Trong túi áo, điện thoại sáng lên.', 'Mẹ · 12 cuộc gọi nhỡ.', 'Màn hình tối lại.'] },
    H: {
      title: 'Về nhà',
      quote: '"…cứ viết đi, tôi sẽ nói như thể đó là lời của mình"',
      lines: [
        'Hình nhân trắng mang tên bạn.',
        'Lần này nó không né, không cà khịa. Nó chỉ nhìn.',
        'Bạn nhấc dép lên. Dép nặng như đá.',
        'Bạn không đập được.'
      ],
      call: [
        'Chuông đổ hai hồi.',
        '"Vy hả con? Vy đó hả?"',
        'Sáu hình nhân cháy cùng một lúc trong lư hóa vàng. Tro bay lên khỏi hẻm.',
        'Tuần sau, tờ báo dưới bàn được thay bằng tờ mới:',
        'ĐÃ TÌM THẤY. Gia đình xin cảm ơn bà con hẻm 27.'
      ]
    }
  };

  /* Bản Nghiệp Báo (khó): thêm kiểu né thứ hai và vật ném từ lượt 2, chỉ tiêu điểm để mở mảnh ký ức. Chỉnh số ở đây. */
  const HARD = {
    quota: [2000, 2200, 2300], // điểm tối thiểu để nhận mảnh lượt 1/2/3; lượt 4+ không cần. Người chơi khá qua ~80% / 50% / 20%
    dolls: {
      batam: { dodge2: 'duck', throw: 'LỜI ĐỒN', throwLine: 'Nghe bà nói nè!' },
      sep: { dodge2: 'side', throw: 'KPI', throwLine: 'Deadline nè!' },
      dongnghiep: { dodge2: 'duck', throw: 'VIỆC', throwLine: 'Việc của chị đó!' },
      nguoiquen: { dodge2: 'side', throw: 'GIẤY NỢ', throwLine: 'Ai nợ ai nè?' },
      traxanh: { dodge2: 'fade', throw: 'TIN NHẮN', throwLine: 'Chị đọc đi nè~' }
    },
    rules: [
      ['☯️', 'Thanh <b>NGHIỆP</b>: đập trượt, đập vào hồ sơ, bị ném trúng, cắt lời đều làm nghiệp đầy lên. Đầy là <b>nghiệp quật</b>, mất lượt.'],
      ['👂', 'Nghe trọn một lời thì thầm sẽ <b>gột bớt nghiệp</b>.'],
      ['🎯', 'Mỗi lượt có <b>chỉ tiêu điểm</b>. Không đủ thì không có mảnh ký ức.'],
      ['🔥', '10 giây cuối: <b>Cơn giận cuối</b>, hình nhân né dồn dập, điểm ×2.']
    ]
  };

  const UI = {
    thay: 'Bà thầy',
    askVow: ['Kể bà nghe, người này làm gì con?', 'Lại là người này. Lần này con kể lại bà nghe coi.', 'Lần thứ ba rồi. Con chắc chưa?'],
    karmaBurst: 'NGHIỆP QUẬT!',
    rage: 'CƠN GIẬN CUỐI · ĐIỂM ×2',
    swat: 'GẠT!',
    hurt: 'TRÚNG!',
    quotaOk: 'ĐỦ CHỈ TIÊU!',
    contentNote: 'Game có chủ đề sức khỏe tinh thần ở phần cuối. Nếu bạn đang thấy nặng lòng, hãy nói chuyện với người bạn tin tưởng, hoặc gọi Đường dây nóng Ngày Mai 096 306 1414.',
    /* Đường dây hỗ trợ: đã xác minh ngày 05/10/2026 qua befrienders.org và findahelpline.com. Kiểm tra lại trước mỗi lần phát hành. */
    help: {
      title: 'Cần người nói chuyện?',
      lines: [
        { name: 'Đường dây nóng Ngày Mai', tel: '0963061414', show: '096 306 1414', note: 'Hỗ trợ tâm lý miễn phí · Thứ Tư đến Chủ nhật, 13:00–20:30' },
        { name: 'Cấp cứu', tel: '115', show: '115', note: 'Khi có nguy hiểm tức thời' }
      ],
      foot: 'Bạn không phải một mình. Gọi cho người thân, bạn bè, hoặc một trong các số trên.'
    },
    stopHint: 'Dừng tay để nghe',
    tiers: ['Đã tay', 'Hả giận', 'Trút sạch'],
    hitWords: ['BỐP!', 'CHÁT!', 'BỘP!', 'PHẠCH!', 'BẸP!'],
    shieldWord: 'KENG!'
  };

  /* Vật phẩm trang trí: demo cho dùng miễn phí. Nguyên tắc: vật phẩm không mua được sự thật. */
  const ITEMS = {
    weapons: [
      { id: 'r1c1', name: 'Dép nhựa xanh', cat: 'dep', snd: 'dep' },
      { id: 'r1c2', name: 'Dép tổ ong vàng', cat: 'dep', snd: 'dep' },
      { id: 'r1c3', name: 'Dép nhựa xanh dương', cat: 'dep', snd: 'dep' },
      { id: 'r1c4', name: 'Dép lào đỏ', cat: 'dep', snd: 'dep' },
      { id: 'r1c5', name: 'Guốc gỗ quai', cat: 'dep', snd: 'go' },
      { id: 'r1c6', name: 'Guốc mộc', cat: 'dep', snd: 'go' },
      { id: 'r1c7', name: 'Dép bông thỏ', cat: 'dep', snd: 'bong' },
      { id: 'r1c8', name: 'Dép bông gấu', cat: 'dep', snd: 'bong' },
      { id: 'r1c9', name: 'Dép sọc', cat: 'dep', snd: 'dep' },
      { id: 'r1c10', name: 'Dép ếch', cat: 'dep', snd: 'dep' },
      { id: 'r1c11', name: 'Dép sục trắng', cat: 'dep', snd: 'dep' },
      { id: 'r1c12', name: 'Giày cao gót', cat: 'dep', snd: 'giay' },
      { id: 'r2c1', name: 'Giày tây đen', cat: 'dep', snd: 'giay' },
      { id: 'r2c2', name: 'Giày da nâu', cat: 'dep', snd: 'giay' },
      { id: 'r2c3', name: 'Giày thể thao', cat: 'dep', snd: 'giay' },
      { id: 'r2c4', name: 'Giày vải đỏ', cat: 'dep', snd: 'giay' },
      { id: 'r2c5', name: 'Giày vải đen', cat: 'dep', snd: 'giay' },
      { id: 'r2c6', name: 'Dép lào cũ', cat: 'dep', snd: 'dep' },
      { id: 'r2c7', name: 'Dép cói', cat: 'dep', snd: 'dep' },
      { id: 'r2c8', name: 'Dép cói đan', cat: 'dep', snd: 'dep' },
      { id: 'r2c9', name: 'Dép quai ngang', cat: 'dep', snd: 'dep' },
      { id: 'r2c10', name: 'Guốc đôi', cat: 'dep', snd: 'go' },
      { id: 'r2c11', name: 'Dép bông hồng', cat: 'dep', snd: 'bong' },
      { id: 'r2c12', name: 'Guốc Nhật', cat: 'dep', snd: 'go' },
      { id: 'r2c13', name: 'Ủng cao su', cat: 'dep', snd: 'giay' },
      { id: 'r3c1', name: 'Ghế nhựa đỏ', cat: 'ghe', snd: 'ghe' },
      { id: 'r3c2', name: 'Ghế nhựa xanh', cat: 'ghe', snd: 'ghe' },
      { id: 'r3c3', name: 'Ghế nhựa cao', cat: 'ghe', snd: 'ghe' },
      { id: 'r3c4', name: 'Ghế đẩu gỗ', cat: 'ghe', snd: 'go' },
      { id: 'r3c5', name: 'Ghế đôn tròn', cat: 'ghe', snd: 'go' },
      { id: 'r3c6', name: 'Ghế inox', cat: 'ghe', snd: 'kimloai' },
      { id: 'r3c7', name: 'Ghế tựa gỗ', cat: 'ghe', snd: 'go' },
      { id: 'r3c8', name: 'Ghế văn phòng', cat: 'ghe', snd: 'kimloai' },
      { id: 'r3c9', name: 'Ghế xếp', cat: 'ghe', snd: 'kimloai' },
      { id: 'r3c10', name: 'Ghế đẩu vuông', cat: 'ghe', snd: 'go' },
      { id: 'r3c11', name: 'Ghế quầy xanh', cat: 'ghe', snd: 'kimloai' },
      { id: 'r3c12', name: 'Ghế quầy đỏ', cat: 'ghe', snd: 'kimloai' },
      { id: 'r4c1', name: 'Tấm ván', cat: 'bep', snd: 'go' },
      { id: 'r4c2', name: 'Viên gạch', cat: 'bep', snd: 'da' },
      { id: 'r4c3', name: 'Cục bê tông', cat: 'bep', snd: 'da' },
      { id: 'r4c4', name: 'Khúc gỗ', cat: 'bep', snd: 'go' },
      { id: 'r4c5', name: 'Tờ báo cuộn', cat: 'bep', snd: 'giay_bao' },
      { id: 'r4c6', name: 'Chảo', cat: 'bep', snd: 'kimloai' },
      { id: 'r4c7', name: 'Nồi', cat: 'bep', snd: 'kimloai' },
      { id: 'r4c8', name: 'Xoong', cat: 'bep', snd: 'kimloai' },
      { id: 'r4c9', name: 'Xẻng lật', cat: 'bep', snd: 'kimloai' },
      { id: 'r4c10', name: 'Vá múc canh', cat: 'bep', snd: 'kimloai' },
      { id: 'r4c11', name: 'Muỗng gỗ', cat: 'bep', snd: 'go' },
      { id: 'r4c12', name: 'Cây cán bột', cat: 'bep', snd: 'go' },
      { id: 'r4c13', name: 'Rổ tre', cat: 'bep', snd: 'go' },
      { id: 'r5c1', name: 'Chổi chít', cat: 'khac', snd: 'giay_bao' },
      { id: 'r5c2', name: 'Quạt giấy', cat: 'khac', snd: 'giay_bao' },
      { id: 'r5c3', name: 'Chai nước', cat: 'khac', snd: 'nhua' },
      { id: 'r5c4', name: 'Bình giữ nhiệt', cat: 'khac', snd: 'kimloai' },
      { id: 'r5c5', name: 'Chai thủy tinh', cat: 'khac', snd: 'kimloai' },
      { id: 'r5c6', name: 'Chai tương ớt', cat: 'khac', snd: 'nhua' },
      { id: 'r5c7', name: 'Bình xịt', cat: 'khac', snd: 'kimloai' },
      { id: 'r5c8', name: 'Cây dù', cat: 'khac', snd: 'giay_bao' },
      { id: 'r5c9', name: 'Cà rốt', cat: 'khac', snd: 'rau' },
      { id: 'r5c10', name: 'Củ cải', cat: 'khac', snd: 'rau' },
      { id: 'r5c11', name: 'Con cá', cat: 'khac', snd: 'rau' },
      { id: 'r5c12', name: 'Gà cao su', cat: 'khac', snd: 'cao_su' },
      { id: 'r5c13', name: 'Cây thông cống', cat: 'khac', snd: 'cao_su' }
    ],
    cats: [['dep', 'Dép & giày'], ['ghe', 'Ghế'], ['bep', 'Đồ bếp'], ['khac', 'Linh tinh']],
    trays: [
      { id: 'thuong', name: 'Mâm thường', img: 'fruit-plate', note: 'Nhang, giấy vàng, đĩa trái cây.' },
      { id: 'du_le', name: 'Mâm đủ lễ', img: 'mam_cung_full', note: 'Khăn đỏ, đèn dầu, hoa, lư hương.' }
    ]
  };

  // Vy: cô gái áo xanh lá nơ — chỉ xuất hiện ở cuối (bóng phản chiếu, hình nhân trắng)
  // Vy không có gương mặt riêng: chỉ là bóng trên cửa sắt và hình nhân giấy trắng chưa vẽ mặt
  const VY = { id: 'vy', name: 'Vy', look: { base: 'v3/vy/white', white: 'v3/vy/white', shadow: 'v3/vy/shadow' } };

  root.STORY = { VY, DOLLS, INTRO, SCENES, ENDINGS, UI, ITEMS, HARD };
})(this);
