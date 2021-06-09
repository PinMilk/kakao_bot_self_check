const { SelfChecker } = require('self-check');

new SelfChecker({
    name: '이름',
    birthday: '******', // 생년월일(6자리)
    school: '**학교', // 학교 검색 키워드
    region: '지역(아래 참고)',
    kind: '학교 급(아래 참고)',
    password: '패스워드(4자리)'
}).check();