import React, { useState } from "react";
import { DatePicker, Picker, List } from "antd-mobile";
import { Lunar } from "lunar-javascript";
import moment from "moment";
import { Card, Icon, Button } from "zhui";
import { SxEnum, TimeEnum } from "./invariant";
import { useHistory } from "react-router-dom";

const nowTimeStamp = Date.now();
const now = new Date(nowTimeStamp);

const d = Lunar.fromDate(now);
const timeZhi = d.getTimeZhi();

const years = [];
const defaultYear = [now.getFullYear(), d.getSolar().toYmd()];

for (let i = 1970; i <= now.getFullYear(); i++) {
  const newYear = Lunar.fromYmd(i, 1, 1);
  const realNewYear = newYear.getJieQiTable()["立春"];

  const curYear = realNewYear.next(1);
  const prevYear = realNewYear.next(-1);

  const $curYear = curYear.getLunar();
  const $prevYear = prevYear.getLunar();

  const curGanZhi = $curYear.getYearInGanZhiByLiChun();
  const [, curZhi] = [...curGanZhi];
  const curSx = SxEnum[curZhi];

  const prevGanZhi = $prevYear.getYearInGanZhiByLiChun();
  const [, prevZhi] = [...prevGanZhi];
  const prevSx = SxEnum[prevZhi];

  const isNewYear = moment(now).isAfter(moment(realNewYear.toYmd()));

  const children = isNewYear
    ? [
        {
          label: ` ${curGanZhi} - ${curSx}`,
          value: curYear.toYmd(),
        },
        {
          label: ` ${prevGanZhi} - ${prevSx}`,
          value: prevYear.toYmd(),
        },
      ]
    : [
        {
          label: ` ${prevGanZhi} - ${prevSx}`,
          value: prevYear.toYmd(),
        },
      ];

  years.push({
    label: i,
    value: i,
    children,
  });
}

const gender = [
  {
    value: 1,
    label: "男",
  },
  {
    value: 0,
    label: "女",
  },
];

const time = [
  {
    value: "子",
    label: "子时(23:00-00:59)",
  },
  {
    value: "丑",
    label: "丑时(01:00-02:59)",
  },
  {
    value: "寅",
    label: "寅时(03:00-04:59)",
  },
  {
    value: "卯",
    label: "卯时(05:00-06:59)",
  },
  {
    value: "辰",
    label: "辰时(07:00-08:59)",
  },
  {
    value: "巳",
    label: "巳时(09:00-10:59)",
  },
  {
    value: "午",
    label: "午时(11:00-12:59)",
  },
  {
    value: "未",
    label: "未时(13:00-14:59)",
  },
  {
    value: "申",
    label: "申时(15:00-16:59)",
  },
  {
    value: "酉",
    label: "酉时(17:00-18:59)",
  },
  {
    value: "戌",
    label: "戌时(19:00-20:59)",
  },
  {
    value: "亥",
    label: "亥时(21:00-22:59)",
  },
];

const month = [
  {
    label: "子",
    value: 1,
  },
  {
    label: "丑",
    value: 2,
  },
  {
    label: "寅",
    value: 3,
  },
  {
    label: "卯",
    value: 4,
  },
  {
    label: "辰",
    value: 5,
  },
  {
    label: "巳",
    value: 6,
  },
  {
    label: "午",
    value: 7,
  },
  {
    label: "未",
    value: 8,
  },
  {
    label: "申",
    value: 9,
  },
  {
    label: "酉",
    value: 10,
  },
  {
    label: "戌",
    value: 11,
  },
  {
    label: "亥",
    value: 12,
  },
];

// 正月建寅 亥为月将
// 二月建卯 戌为月将
// 三月建辰 酉为月将
// 四月建巳 申为月将
// 五月建午 未为月将
// 六月建未 午为月将
// 七月建申 巳为月将
// 八月建酉 辰为月将
// 九月建戌 卯为月将
// 十月建亥 寅为月将
// 十一月建子 丑为月将
// 十二月建丑 子为月将
const getGeneral = (date) => {
  const d = Lunar.fromDate(date);
  const lunarMonth = Math.abs(d.getMonth());
  return [13 - lunarMonth];
};

const Home = () => {
  const [state, setState] = useState({
    date: now,
    general: getGeneral(now),
    time: [timeZhi],
    year: defaultYear,
    gender: [1],
  });
  const history = useHistory();

  return (
    <div id="home">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card
          cornerLeft="趋吉"
          cornerRight="避凶"
          img={<Icon color="#fff" type="refresh" style={{ fontSize: 100 }} />}
          title="大六壬占卦"
          underline
          width="100%"
          style={{ height: "100vh", maxWidth: "auto" }}
        >
          <p>先占不测之风云，泄元机藏之秘</p>
          <List className="date-picker-list">
            <Picker
              data={gender}
              value={state.gender}
              onChange={(gender) => {
                setState((state) => ({ ...state, gender }));
              }}
              cols={1}
            >
              <List.Item arrow="horizontal">性别</List.Item>
            </Picker>

            <Picker
              data={years}
              value={state.year}
              onChange={(year) => {
                setState((state) => ({ ...state, year }));
              }}
              cols={2}
            >
              <List.Item arrow="horizontal">生辰</List.Item>
            </Picker>
            <DatePicker
              mode="date"
              title="占日"
              value={state.date}
              onChange={(date) => {
                const general = getGeneral(date);
                setState((state) => ({ ...state, date, general }));
              }}
            >
              <List.Item arrow="horizontal">占日</List.Item>
            </DatePicker>
            <Picker
              data={time}
              value={state.time}
              onChange={(time) => {
                setState((state) => ({ ...state, time }));
              }}
              cols={1}
            >
              <List.Item arrow="horizontal">占时</List.Item>
            </Picker>

            <Picker
              data={month}
              value={state.general}
              onChange={(general) => {
                setState((state) => ({ ...state, general }));
              }}
              cols={1}
            >
              <List.Item arrow="horizontal">月将</List.Item>
            </Picker>

            <List.Item className="submit-block">
              <Button
                theme="yuanshan"
                outline
                size="large"
                style={{ backgroundColor: "transparent" }}
                onClick={() => {
                  const { date, time, gender, year, general } = state;
                  const $day = moment(date);
                  const $time = moment(TimeEnum[time], "HH:mm");
                  const $d = $day.set({
                    hour: $time.get("hour"),
                    minute: $time.get("minute"),
                    second: $time.get("second"),
                  });
                  const [$general] = general;
                  const [$gender] = gender;
                  const [, ymd] = year;
                  history.push({
                    pathname: "/ace",
                    state: {
                      ymd: ymd,
                      gender: $gender,
                      $d: $d.toDate(),
                      general: $general,
                    },
                  });
                }}
              >
                起课
              </Button>
            </List.Item>
          </List>
        </Card>
      </div>
    </div>
  );
};
export default Home;
