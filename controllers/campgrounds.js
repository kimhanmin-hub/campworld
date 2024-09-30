const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require("../cloudinary");

// 모든 캠프그라운드를 조회하여 리스트를 렌더링
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

// 캠프그라운드 등록 폼을 렌더링
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

// 새 캠프그라운드 생성
module.exports.createCampground = async (req, res, next) => {
    // 사용자 입력 위치를 기반으로 지리 정보를 얻기 위해 Mapbox Geocoding API 호출
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    
    // 새 캠프그라운드 객체를 생성하고 지리 정보 및 이미지 추가
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    
    // 캠프그라운드를 데이터베이스에 저장
    await campground.save();
    console.log(campground);
    
    // 성공 플래시 메시지 설정 및 캠프그라운드 상세 페이지로 리다이렉트
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// 캠프그라운드 상세 정보 조회 및 렌더링
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    
    // 캠프그라운드가 존재하지 않을 경우 에러 플래시 메시지 설정 후 리다이렉트
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    
    // 캠프그라운드 상세 페이지 렌더링
    res.render('campgrounds/show', { campground });
}

// 캠프그라운드 수정 폼을 렌더링
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    // 캠프그라운드가 존재하지 않을 경우 에러 플래시 메시지 설정 후 리다이렉트
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    
    // 캠프그라운드 수정 폼 렌더링
    res.render('campgrounds/edit', { campground });
}

// 캠프그라운드 업데이트
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    
    // 캠프그라운드를 업데이트
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    
    // 새로 업로드된 이미지 추가
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    
    // 캠프그라운드 객체 저장
    await campground.save();
    
    // 삭제할 이미지가 있는 경우 클라우드에서 삭제
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    
    // 성공 플래시 메시지 설정 및 캠프그라운드 상세 페이지로 리다이렉트
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// 캠프그라운드 삭제
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    
    // 캠프그라운드를 데이터베이스에서 삭제
    await Campground.findByIdAndDelete(id);
    
    // 성공 플래시 메시지 설정 및 캠프그라운드 리스트 페이지로 리다이렉트
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}
