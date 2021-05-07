const { SchoolFinder } = require('./searchSchool');

exports.SelfChecker = /** @class */ (function () {
    const {
        Jsoup,
        Connection
    } = org.jsoup;
    /**
     * 
     * @param {string} name - 이름(주민등록상의 이름)
     * @param {string} birthday - 생년월일(주민등록상)
     * @param {string} school - 학교명(재학중인 학교)
     * @param {string} region - 학교가 있는 지역(광역시, 도 단위)
     * @param {string?} kind - 학교 급(초등학교, 중학교, 고등학교, 특수학교)
     * @param {string?} password - 자가진단 비밀번호(4자리 숫자)
     * @param {string?} schoolCode - 학교 코드
     * @constructor
     */
    function SelfChecker(name, birthday, school, region, kind, password, schoolCode) {
        if (kind === void 0) this.kind = '';
        if (password === void 0) this.password = '1234';
        if (schoolCode === void 0) this.schoolCode = '';
        this.url = {
            '서울': 'https://senhcs.eduro.go.kr',
            '부산': 'https://penhcs.eduro.go.kr',
            '대구': 'https://dgehcs.eduro.go.kr',
            '인천': 'https://icehcs.eduro.go.kr',
            '광주': 'https://genhcs.eduro.go.kr',
            '대전': 'https://djehcs.eduro.go.kr',
            '울산': 'https://usehcs.eduro.go.kr',
            '세종': 'https://sjehcs.eduro.go.kr',
            '경기': 'https://goehcs.eduro.go.kr',
            '강원': 'https://kwehcs.eduro.go.kr',
            '충북': 'https://cbehcs.eduro.go.kr',
            '충남': 'https://cnehcs.eduro.go.kr',
            '전북': 'https://jbehcs.eduro.go.kr',
            '전남': 'https://jnehcs.eduro.go.kr',
            '경북': 'https://gbehcs.eduro.go.kr',
            '경남': 'https://gnehcs.eduro.go.kr',
            '제주': 'https://jjehcs.eduro.go.kr',
            'path': [
                '/v2/findUser',
                '/v2/validatePassword',
                '/v2/selectUserGroup',
                '/v2/getUserInfo',
                '/registerServey'
            ]
        };
        this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
        this.name = name;
        this.birthday = birthday;
        this.school = school;
        this.region = region;
        this.kind = kind;
        this.password = password;
        this.schoolCode = schoolCode;
        this.hostURI = this.url[region];
        return this;
    }
    /**
     * 
     * @param {string} message An message to be encrypted
     * @copyright 새싹멤버(https://cafe.naver.com/nameyee/27414)
     * @returns {string}
     * @private
     */
    SelfChecker.prototype.encrypt = function (message) {
        const key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHjJzGs9MMMWtQIDAQAB";
        const bytes = java.util.Base64.getDecoder().decode(key);
        const keyFactory = java.security.KeyFactory.getInstance("RSA");
        const publicKey = keyFactory.generatePublic(new java.security.spec.X509EncodedKeySpec(bytes));
        const cipher = javax.crypto.Cipher.getInstance("RSA/None/PKCS1Padding");
        cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, publicKey);
        const byte = cipher.doFinal(new java.lang.String(message).getBytes("UTF-8"));
        const result = java.util.Base64.getEncoder().encodeToString(byte);
        return result;
    };
    /**
     * 
     * @returns {SelfChecker}
     * @private
     */
    SelfChecker.prototype.setSchoolCode = function () {
        this.schoolCode = this.schoolCode || new SchoolFinder(this.school, this.region, this.kind).getCode();
        return this;
    };
    /**
     * 
     * @returns {string}
     */
    SelfChecker.prototype.getFirstToken = function () {
        const url = this.url[this.region] + this.url.path[0];
        this.setSchoolCode();
        const data = {
            'orgCode': this.schoolCode,
            'name': this.encrypt(this.name),
            'birthday': this.encrypt(this.birthday),
            'stdntPNo': null,
            'loginType': 'school'
        };

        const response = Jsoup.connect(url)
            .method(Connection.Method.POST)
            .userAgent(this.userAgent)
            .header('Content-Type', 'application/json; Charset=UTF-8')
            .header('Origin', 'https://hcs.eduro.go.kr')
            .header('Referer', 'https://hcs.eduro.go.kr/')
            .requestBody(JSON.stringify(data))
            .execute();
        const document = JSON.parse(response.parse());
        this.school = document.orgName;
        const { token } = document;
        return token;
    };
    /**
     * 
     * @returns {string}
     */
    SelfChecker.prototype.getSecondToken = function () {
        const requestToken = this.getFirstToken();
        const url = this.url[this.region] + this.url.path[1];
        const data = {
            'password': this.encrypt(this.password),
            'deviceUuid': ''
        };
        const response = Jsoup.connect(url)
            .method(Connection.Method.POST)
            .userAgent(this.userAgent)
            .header('Authorization', requestToken)
            .header('Content-Type', 'application/json; Charset=UTF-8')
            .header('Origin', 'https://hcs.eduro.go.kr')
            .header('Referer', 'https://hcs.eduro.go.kr/')
            .requestBody(JSON.stringify(data))
            .execute();
        const document = response.parse();
        const token = document.text();
        return token;
    };
    /**
     * 
     * @returns {string}
     */
    SelfChecker.prototype.getThirdToken = function () {
        const requestToken = this.getSecondToken();
        const url = this.url[this.region] + this.url.path[2];
        const data = {};
        const response = Jsoup.connect(url)
            .method(Connection.Method.POST)
            .userAgent(this.userAgent)
            .header('Authorization', requestToken)
            .header('Content-Type', 'application/json; Charset=UTF-8')
            .header('Origin', 'https://hcs.eduro.go.kr')
            .header('Referer', 'https://hcs.eduro.go.kr/')
            .requestBody(JSON.stringify(data))
            .execute();
        const document = JSON.parse(response.parse());
        this.userPNo = document[0].userPNo;
        const { token } = document[0];
        return token;
    };
    SelfChecker.prototype.check = function () {
        const token = this.getThirdToken();
        const name = this.name;
        const birthday = this.birthday;
        const school = this.school;
        const region = this.region;
        const kind = this.kind;
        const schoolCode = this.schoolCode;
        const url = this.url[this.region] + this.url.path[4];
        const data = {
            'rspns01': '1',
            'rspns02': '1',
            'rspns03': null,
            'rspns04': null,
            'rspns05': null,
            'rspns06': null,
            'rspns07': null,
            'rspns08': null,
            'rspns09': '0',
            'rspns10': null,
            'rspns11': null,
            'rspns12': null,
            'rspns13': null,
            'rspns14': null,
            'rspns15': null,
            'rspns00': 'Y',
            'deviceuuid': '',
            'upperToken': token,
            'upperUserNameEncpt': name
        };
        const response = Jsoup.connect(url)
            .method(Connection.Method.POST)
            .userAgent(this.userAgent)
            .header('Authorization', token)
            .header('Content-Type', 'application/json; Charset=UTF-8')
            .header('Origin', 'https://hcs.eduro.go.kr')
            .header('Referer', 'https://hcs.eduro.go.kr/')
            .requestBody(JSON.stringify(data))
            .execute();
        const document = JSON.parse(response.parse());
        const checkTime = document.inveYmd;
        const result = {
            'name': name,
            'birthday': birthday,
            'school': school,
            'region': region,
            'kind': kind,
            'checkTime': checkTime,
            'schoolCode': schoolCode
        };
        return result;
    };
    return SelfChecker;
})();