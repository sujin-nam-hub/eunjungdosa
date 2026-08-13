export default function handler(req, res) {
  const daily = globalThis.__eunjeongDaily || { day: '(아직 호출 없음)', count: 0 };
  res.status(200).json({
    오늘: daily.day,
    오늘_호출수_대략: daily.count,
    하루상한: 300,
    안내: '정확한 사용량과 비용은 Anthropic Console → Usage 에서 확인하세요.'
  });
}
