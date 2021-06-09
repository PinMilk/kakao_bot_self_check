'use strict';
exports.SchoolFinder = /** @class */ (function () {
    /**
     * 
     * @param {string} name School name
     * @param {string} region School region
     * @param {string} kind School kind
     */
    function SchoolFinder(name, region, kind) {
        this.name = name;
        this.region = region;
        this.kind = kind || '';
        this.regionCode = {
            "서울": "01",
            "부산": "02",
            "대구": "03",
            "인천": "04",
            "광주": "05",
            "대전": "06",
            "울산": "07",
            "세종": "08",
            "경기": "10",
            "강원": "11",
            "충북": "12",
            "충남": "13",
            "전북": "14",
            "전남": "15",
            "경북": "16",
            "경남": "17",
            "제주": "18"
        };
        this.schoolKind = {
            "유치원": "1",
            "초등학교": "2",
            "중학교": "3",
            "고등학교": "4",
            "특수학교": "5"
        };
        return this;
    }
    /**
     * 
     * @returns {any}
     */
    SchoolFinder.prototype.find = function(){
        let response = org.jsoup.Jsoup.connect('https://hcs.eduro.go.kr/v2/searchSchool?lctnScCode=' + this.regionCode[this.region] + '&' +  (!!this.kind ? ('schulCrseScCode' + this.schoolKind[this.kind] + '&' ): '' ) +  'orgName='  + encodeURI(this.name))
            .ignoreContentType(true)
            .userAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1')
            .execute();
        const document = response.parse();
        const result = JSON.parse(document.wholeText());
        return result.schulList[0];
    }
    /**
     * 
     * @returns {string} School code
     */
    SchoolFinder.prototype.getCode = function() {
        const schoolCode = this.find().orgCode;
        return schoolCode;
    }
    return SchoolFinder;
})();