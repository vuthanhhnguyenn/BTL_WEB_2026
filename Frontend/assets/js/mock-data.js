(() => {
  const DEMO_ROOMS = [
    {
      id: 1,
      title: 'Phòng studio full nội thất - Quận 1',
      address: '12 Nguyễn Thị Minh Khai, Bến Nghé, Quận 1, TP.HCM',
      district: 'Quận 1',
      city: 'TP.HCM',
      mapAddress: '12 Nguyễn Thị Minh Khai, Bến Nghé, Quận 1, TP.HCM',
      priceFrom: 5500000,
      priceTo: 6500000,
      area: 28,
      direction: 'Đông Nam',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Phòng mới, có ban công, máy lạnh, máy giặt riêng. Gần trường và trung tâm thương mại.',
      images: [
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Trần Hải Nam',
        phone: '0909 112 233',
        email: 'nam.tran@example.com'
      }
    },
    {
      id: 2,
      title: 'Phòng trọ giá tốt gần ĐH Bách Khoa',
      address: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM',
      district: 'Quận 10',
      city: 'TP.HCM',
      mapAddress: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM',
      priceFrom: 3200000,
      priceTo: 3900000,
      area: 20,
      direction: 'Nam',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Có gác lửng, giờ giấc tự do, khóa vân tay. Hẻm xe hơi, an ninh tốt.',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Nguyễn Minh Châu',
        phone: '0918 334 455',
        email: 'chau.nguyen@example.com'
      }
    },
    {
      id: 3,
      title: 'Căn hộ mini có cửa sổ lớn - Bình Thạnh',
      address: '88 Điện Biên Phủ, Phường 17, Bình Thạnh, TP.HCM',
      district: 'Bình Thạnh',
      city: 'TP.HCM',
      mapAddress: '88 Điện Biên Phủ, Phường 17, Bình Thạnh, TP.HCM',
      priceFrom: 4800000,
      priceTo: 5600000,
      area: 26,
      direction: 'Đông',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Không gian sáng, thoáng mát, có bãi xe rộng. Cách Landmark 81 chỉ 5 phút.',
      images: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Phạm Quốc Đạt',
        phone: '0933 678 900',
        email: 'dat.pham@example.com'
      }
    },
    {
      id: 4,
      title: 'Phòng trọ có gác, gần cầu Rồng',
      address: '45 Trần Phú, Hải Châu, Đà Nẵng',
      district: 'Hải Châu',
      city: 'Đà Nẵng',
      mapAddress: '45 Trần Phú, Hải Châu, Đà Nẵng',
      priceFrom: 2800000,
      priceTo: 3400000,
      area: 22,
      direction: 'Tây Bắc',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Phòng yên tĩnh, gần chợ và bến xe bus. Nội thất cơ bản, vào ở ngay.',
      images: [
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Lê Thị Hương',
        phone: '0905 123 678',
        email: 'huong.le@example.com'
      }
    },
    {
      id: 5,
      title: 'Phòng cao cấp khu Mỹ Đình',
      address: '17 Hàm Nghi, Nam Từ Liêm, Hà Nội',
      district: 'Nam Từ Liêm',
      city: 'Hà Nội',
      mapAddress: '17 Hàm Nghi, Nam Từ Liêm, Hà Nội',
      priceFrom: 5200000,
      priceTo: 6800000,
      area: 30,
      direction: 'Bắc',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Tòa nhà có thang máy, bảo vệ 24/7, phòng trang bị đầy đủ nội thất.',
      images: [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Vũ Hoài An',
        phone: '0982 567 321',
        email: 'an.vu@example.com'
      }
    },
    {
      id: 6,
      title: 'Phòng trọ gần biển Mỹ Khê',
      address: '220 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
      district: 'Sơn Trà',
      city: 'Đà Nẵng',
      mapAddress: '220 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
      priceFrom: 3600000,
      priceTo: 4300000,
      area: 24,
      direction: 'Đông Bắc',
      bedrooms: 1,
      bathrooms: 1,
      description: 'View biển, thoáng gió, có bếp riêng và sân phơi chung.',
      images: [
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Đỗ Đức Mạnh',
        phone: '0912 112 789',
        email: 'manh.do@example.com'
      }
    },
    {
      id: 7,
      title: 'Phòng mới xây full tiện nghi - Gò Vấp',
      address: '101 Phan Văn Trị, Gò Vấp, TP.HCM',
      district: 'Gò Vấp',
      city: 'TP.HCM',
      mapAddress: '101 Phan Văn Trị, Gò Vấp, TP.HCM',
      priceFrom: 4000000,
      priceTo: 4800000,
      area: 25,
      direction: 'Tây',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Khu dân cư văn minh, có thang máy và sân thượng rộng.',
      images: [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Phan Gia Bảo',
        phone: '0977 998 221',
        email: 'bao.phan@example.com'
      }
    },
    {
      id: 8,
      title: 'Phòng rộng 32m2 gần Vincom',
      address: '52 Lê Thánh Tôn, Quận 1, TP.HCM',
      district: 'Quận 1',
      city: 'TP.HCM',
      mapAddress: '52 Lê Thánh Tôn, Quận 1, TP.HCM',
      priceFrom: 6500000,
      priceTo: 7800000,
      area: 32,
      direction: 'Đông Nam',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Không gian sang trọng, phù hợp nhân viên văn phòng ở trung tâm.',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Lâm Nhật Quang',
        phone: '0903 777 999',
        email: 'quang.lam@example.com'
      }
    },
    {
      id: 9,
      title: 'Phòng trọ yên tĩnh gần Đại học Cần Thơ',
      address: '3/2 Xuân Khánh, Ninh Kiều, Cần Thơ',
      district: 'Ninh Kiều',
      city: 'Cần Thơ',
      mapAddress: '3/2 Xuân Khánh, Ninh Kiều, Cần Thơ',
      priceFrom: 2500000,
      priceTo: 3200000,
      area: 19,
      direction: 'Nam',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Có camera, chỗ để xe miễn phí, phù hợp sinh viên.',
      images: [
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Đặng Tấn Tài',
        phone: '0945 213 658',
        email: 'tai.dang@example.com'
      }
    },
    {
      id: 10,
      title: 'Căn hộ mini gần phố cổ',
      address: '86 Hàng Bông, Hoàn Kiếm, Hà Nội',
      district: 'Hoàn Kiếm',
      city: 'Hà Nội',
      mapAddress: '86 Hàng Bông, Hoàn Kiếm, Hà Nội',
      priceFrom: 5900000,
      priceTo: 6900000,
      area: 27,
      direction: 'Đông Bắc',
      bedrooms: 1,
      bathrooms: 1,
      description: 'Nội thất đẹp, gần hồ Gươm, khu dân cư lịch sự và an ninh.',
      images: [
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ],
      contact: {
        name: 'Ngô Thanh Bình',
        phone: '0971 455 667',
        email: 'binh.ngo@example.com'
      }
    }
  ];

  window.DEMO_ROOMS = DEMO_ROOMS;
})();
