<template>
  <div id="hot-preview">
    <h2>handsontable demo</h2>
    <HotTable :root="root" :settings="hotSettings" ref="ht"></HotTable>
    <div class="tools">
      <button @click="refreshData">刷新数据</button>
      <button @click="transformTable">行列转置</button>
    </div>
    <div id="biChart" class="biChart"></div>
    <div id="biChart2" class="biChart2"></div>
  </div>
</template>

<script>
  import HotTable from '@handsontable/vue'
  import '@/plugins/formula/PNFormulaPlugin'
  import hotFormulaParser from 'hot-formula-parser'
  import Vue from 'vue';
  import echarts from "static/lib/echarts/echarts.js"

  export default {
    data: function() {
      return {
        root: 'test-hot',
        hotSettings: {
          colHeaders: true,
          rowHeaders: true,
          // formulas: true,
          dropdownMenu: true,
          contextMenu: true,
          filters: true,
          PNFormulaPlugin: true,
          data: [["", "个人网银", "手机银行", "短信金融", "微信金融"],
            ["2017", 14, 11, 12, 13],
            ["2018", 24, 21, 22, 23],
            ["2019", 34, 31, 32, 33]],
          columnSorting: true
        },
        tableData: [],
        myChart1: null,
        myChart2: null,
//        myChart3: null
      };
    },
    components: {
      HotTable
    },
    created: function (){

    },
    mounted: function() {
      console.log("mounted!")
      this.refreshData()
    },
    updated: function() {
      console.log("updated!")
    },
    methods: {
      refreshData: function () {
        this.tableData = this.$refs.ht.table.getData();
        console.log(this.tableData)
        var data1 = this.removeHeadAndTail(this.tableData)
        var cnvtTableData = this.rotateArray(this.tableData)
        var data2 = this.removeHead(cnvtTableData)

        if(!this.myChart1)
          this.myChart1 = echarts.init(document.getElementById('biChart'));
        // 指定图表的配置项和数据
        var option = {
          color: ['#c23531','#2f4554', '#546570', '#c4ccd3'],
          title: {
            text: '直接报表展示'
          },
          tooltip: {},
          legend: {
            data:[this.tableData[1][0], this.tableData[2][0], this.tableData[3][0]]
          },
          xAxis: {
            data: data1[0]
          },
          yAxis: {},
          series: [{
            name: this.tableData[1][0],
            type: 'bar',
            data: data1[1],
            color: ['#759aa0','#e69d87',' #7289ab', '#91ca8c','#f49f42'],
          },{
            name: this.tableData[2][0],
            type: 'bar',
            data: data1[2],
            color: ['#e69d87',' #7289ab', '#91ca8c','#f49f42'],
          },{
            name: this.tableData[3][0],
            type: 'bar',
            data: data1[3],
            color: ['#91ca8c','#f49f42'],
          }]
        };
        // 使用刚指定的配置项和数据显示图表。
        this.myChart1.setOption(option);

//        if(!this.myChart3)
//          this.myChart3 = echarts.init(document.getElementById('biChart3'));
//        // 指定图表的配置项和数据
//        var option3 = {
//          color: ['#c23531','#2f4554', '#546570', '#c4ccd3'],
//          title: {
//            text: '转置报表展示'
//          },
//          tooltip: {},
//          legend: {
//            data:[this.tableData[0][1],this.tableData[0][2], this.tableData[0][3], this.tableData[0][4]]
//          },
//          xAxis: {
//            data: data2[0]
//          },
//          yAxis: {},
//          series: [{
//            name: this.tableData[0][1],
//            type: 'bar',
//            data: data2[1],
//            color: ['#759aa0','#e69d87',' #7289ab', '#91ca8c','#f49f42'],
//          },{
//            name: this.tableData[0][2],
//            type: 'bar',
//            data: data2[2],
//            color: ['#e69d87',' #7289ab', '#91ca8c','#f49f42'],
//          },{
//            name: this.tableData[0][3],
//            type: 'bar',
//            data: data2[3],
//            color: ['#91ca8c','#f49f42'],
//          },,{
//            name: this.tableData[0][4],
//            type: 'bar',
//            data: data2[4],
//            color: ['#f49f42'],
//          }]
//        };
//        // 使用刚指定的配置项和数据显示图表。
//        this.myChart3.setOption(option3);


        if(!this.myChart2)
          this.myChart2 = echarts.init(document.getElementById('biChart2'));
        var option2 = {
          title : {
            text: this.tableData[1][0] + '年各渠道占比',
            subtext: '',
            x:'left'
          },
          tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            data: data1[0],
            selected: this.cnvtArrayToObj(data1[0])
          },
          series : [
            {
              name: '渠道占比',
              type: 'pie',
              radius : '55%',
              center: ['40%', '50%'],
              data: this.cnvtArrayToObjArray(data1[0], data1[1]),
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        this.myChart2.setOption(option2);
      },
      removeHeadAndTail: function (srcArray) {
        var newArray = $.extend(true, [], srcArray)
        for(var i = 0; i < srcArray.length; i++) {
          newArray[i].splice(0, 1);  // 移除行首
//          newArray[i].splice(-1, 1); // 移除行尾
        }
        console.log(newArray)
        return newArray
      },
      removeHead: function (srcArray) {
        var newArray = $.extend(true, [], srcArray)
        for(var i = 0; i < srcArray.length; i++) {
          newArray[i].splice(0, 1);  // 移除行首
        }
        console.log(newArray)
        return newArray
      },
      cnvtArrayToObj: function(names) {
        var obj = {};
        for (var i = 0; names && i < names.length; i++) {
          obj[names[i]] = true
        }
        return obj;
      },
      cnvtArrayToObjArray: function(names, values) {
        var objArray = [];
        for(var i = 0; names && values && i < names.length; i++) {
          objArray.push({'name': names[i], 'value': values[i]})
        }
        return objArray;
      },
      rotateArray: function(srcArray) {
        var newArray = [];
        for(var x = 0;  x < srcArray.length; x++) {
          for(var y = 0; y < srcArray[x].length; y++) {
            if(!newArray[y]) {
              newArray[y] = []
            }
            newArray[y][x] = srcArray[x][y]
          }
        }
        return newArray
      },
      transformTable: function () {
        var dataCfg = this.rotateArray(this.hotSettings.data)
        this.$set(this.hotSettings, 'data', dataCfg)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  #hot-display-license-info {
    display: none;
  }

  .wtHolder {
    width: 100% !important;
    height: 100% !important;
  }

  .tools {
    display: flex;
    margin: 20px 0;
  }
  .biChart {
    margin-top: 20px;
  }
  .biChart, .biChart2, .biChart3 {
    width: 600px;
    height: 400px;
  }
</style>
