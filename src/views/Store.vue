<template>
  <div id="Store" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="mx-2" @click="$print($refs.print)" color="success" dark>
        <v-icon>la-print</v-icon>
        طباعة
      </v-btn>
      <v-btn color="success" @click="tablesToExcel()">
        <v-icon left>la-download</v-icon>
        <span>تحميل</span>
      </v-btn>
    </v-app-bar>

    <v-card ref="print" class="pa-10">
      <center class="printHeader">
        <h2>اعداد المخزن</h2>
      </center>

      <v-row>
        <v-col v-if="this.checkPermission('store_search_supervisor')">
          <v-autocomplete :items="supervisors" item-text="username" item-value="idUser" outlined dense hide-details
            label="المشرف" v-model="selectedSuperVisor" @change="setDelegates()"></v-autocomplete>
        </v-col>
        <v-col v-if="this.checkPermission('store_search_delegate')">
          <v-autocomplete :items="delegates" item-text="username" item-value="idUser" outlined dense hide-details
            multiple label="المندوب" v-model="selectedDelegate"></v-autocomplete>
        </v-col>
        <v-col>
          <v-text-field outlined dense hide-details label="من تاريخ" v-model="search.from" type="date"></v-text-field>
        </v-col>
        <v-col>
          <v-text-field outlined dense hide-details label="الى تاريخ" v-model="search.to" type="date"></v-text-field>
        </v-col>
        <v-col>
          <v-btn @click="fetchSearch()" color="primary"> بحث </v-btn>
        </v-col>
      </v-row>
      <br />
      <v-data-table :items-per-page="-1" :items="store" :headers="checkPermission('store_view_incomes') && selectedDelegate.length == 0
        ? tableHeader
        : tableHeader2
        " multi-sort>
        <template v-slot:[`item.imagePath`]="{ item }">
          <v-avatar size="36">
            <img v-if="item.imagePath != null" :src="$baseUrl + 'files/' + item.imagePath" />
            <img v-if="item.imagePath == null" src="@/assets/no_image_placeholder.png" />
          </v-avatar>
        </template>
        <template v-slot:[`item.lastRemaining`]="{ item }">
          {{
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalBuy +
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalRestores +
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalTempBuy -
            (lastStore.filter((s) => s.idItem == item.idItem)[0].totalSell +
              lastStore.filter((s) => s.idItem == item.idItem)[0]
                .totalBuyRestores)
          }}
        </template>
        <template v-slot:[`item.storex`]="{ item }">
          {{ item.storex }}
        </template>
        <template v-slot:[`item.stock`]="{ item }">
          <v-chip :color="item.stock < 0.25 ? 'error' : 'success'">
            {{ item.stock.toFixed(2).replace(/[.,]00$/, "") }}</v-chip>
        </template>
        <template v-slot:[`item.totalDamaged`]="{ item }">
          <a v-if="selectedDelegate.length != 1" target="_blank" :href="'/damagedItemsRail?itemId=' +
            item.idItem +
            '&from=' +
            search.from +
            '&to=' +
            search.to
            ">{{ item.totalDamaged.toLocaleString() }}</a>
          <a v-if="selectedDelegate.length == 1" target="_blank" :href="'/damagedItemsRail?itemId=' +
            item.idItem +
            '&from=' +
            search.from +
            '&to=' +
            search.to +
            '&delegateId=' +
            selectedDelegate[0]
            ">{{ item.totalDamaged.toLocaleString() }}</a>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn v-if="checkPermission('item_rail')" target="_BLANK" :to="'/itemRail/' +
            item.idItem +
            '?name=' +
            item.fullItemName +
            '&from=' +
            search.from +
            '&to=' +
            search.to
            " icon>
            <v-icon>la-eye</v-icon>
          </v-btn>
        </template>
        <template v-slot:[`item.actions2`]="{ item }">
          <v-btn v-if="checkPermission('item_rail')" target="_BLANK" :to="'/itemRail/' +
            item.idItem +
            '?name=' +
            item.fullItemName +
            '&from=' +
            search.from +
            '&to=' +
            search.to +
            '&userId=' +
            selectedDelegate
            " icon>
            <v-icon>la-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import * as XLSX from "xlsx-js-style/dist/xlsx.bundle";

export default {
  name: "Store",
  data: () => ({
    store: [],
    lastStore: [],
    delegates: [],
    permissions: [],
    supervisors: [],
    selectedSuperVisor: null,
    selectedDelegate: [],
    users: [
      {
        idUser: 0,
        username: "لا يوجد",
      },
    ],
    search: {
      from: "",
      to: "",
    },
    tableHeader: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "المورد", value: "manufactureName" },
      { text: "المجموعة", value: "itemGroupName" },
      { text: "رصيد اول المدة", value: "storex" },
      { text: "المبيعات", value: "totalSell" },
      { text: "المشتريات", value: "totalBuy" },
      { text: "الراجع", value: "totalRestores" },
      { text: "التالف", value: "totalDamaged" },
      { text: "راجع المشتريات", value: "totalBuyRestores" },
      { text: "شراء مؤقت", value: "totalTempBuy" },
      { text: "المتبقي", value: "stock" },
      { text: "الاجراءات", value: "actions" },
    ],
    tableHeader2: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "المورد", value: "manufactureName" },
      { text: "المجموعة", value: "itemGroupName" },
      { text: "المبيعات", value: "totalSell" },
      { text: "المبلغ الاجمالي", value: "totalSellPrice" },
      { text: "التالف", value: "totalDamaged" },
      { text: "المبلغ للتالف", value: "totalDamagedPrice" },
      { text: "الاجراءات", value: "actions2" },
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("store")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    // this.fetch();
    this.getCurrentDate().then((value) => {
      this.search.from = value;
      this.search.to = value;
    });

    this.$http.get(this.$baseUrl + "users/role/3").then((res) => {
      this.supervisors = res.data;
    });
    this.$http.get(this.$baseUrl + "users").then((res) => {
      this.delegates = res.data;

      setTimeout(() => {
        if (this.$route.query.delegate) {
          this.selectedDelegate.push(parseInt(this.$route.query.delegate));
          this.search.from = this.$route.query.dateFrom;
          this.search.to = this.$route.query.dateTo;
          setTimeout(() => {
            this.fetchSearch();
          }, 1000);
        }
      }, 1000);
    });
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "item/detailedStore-new")
        .then((res) => {
          this.store = res.data;
        })
        .finally(() => loading.hide());
    },
    setDelegates() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
          "supervisorDelegates/userid/" +
          this.selectedSuperVisor
        )
        .then((res) => {
          this.selectedDelegate = res.data.map((e) => e.delegateId);
          this.selectedDelegate.push(this.selectedSuperVisor);
        })
        .finally(() => loading.hide());
    },
    fetchSearch() {
      let loading = this.$loading.show();
      if (this.selectedDelegate.length == 0) {
        this.$http
          .get(
            this.$baseUrl +
            `item/detailedStore-new?from=${this.search.from}&to=${this.search.to}`
          )
          .then((res) => {
            var secondDate = new Date(this.search.from);
            var x = 1;
            secondDate.setDate(secondDate.getDate() - x);
            var secondDateString =
              secondDate.getFullYear() +
              "-" +
              (secondDate.getMonth() + 1) +
              "-" +
              secondDate.getDate();
            console.log(secondDateString);
            let tempStore = res.data;
            this.$http
              .get(
                this.$baseUrl +
                `item/compressedDetailedStore-new?from=2023-05-30&to=${secondDateString}`
              )
              .then((res) => {
                let stockItems = res.data.map(
                  (row) => ((row.stocks = JSON.parse(row.stocks)), row)
                );
                tempStore.forEach(item => {
                  let stox = stockItems.filter(e => e.idItem == item.idItem)[0].stocks;
                  item.storex = ((stox.buy + stox.restore) - stox.sell);
                  item.storexx = ((stox.buy + stox.restore) - stox.sell);
                  item.stock = item.storexx + item.totalBuy + item.totalRestores - item.totalSell - item.totalBuyRestores;
                });
                this.store = tempStore;
                console.log(secondDateString, stockItems, this.store);
              }).finally(() => loading.hide());

          })
      } else {
        this.$http
          .get(
            this.$baseUrl +
            `item/detailedStoreByUser-new/${JSON.stringify(
              this.selectedDelegate
            ).slice(1, -1)}?from=${this.search.from}&to=${this.search.to}`
          )
          .then((res) => {
            this.store = res.data;
            console.log(this.store);
          })
          .finally(() => loading.hide());
      }
    },
    getTotal(item) {
      return (
        item.stock -
        item.totalSell -
        item.totalBuyRestores +
        item.totalBuy +
        item.totalRestores +
        item.totalTempBuy
      );
    },
    getTotal2(item) {
      let pastItem = this.lastStore.filter(e => e.idItem == item.idItem)[0];
      return (
        item.stock +
        pastItem.totalSell +
        pastItem.totalBuyRestores -
        pastItem.totalBuy -
        pastItem.totalRestores -
        pastItem.totalTempBuy
      );
    },
    sort() {
      this.store = this.store.sort((a, b) =>
        a.totalSell.localeCompare(b.totalSell)
      );
    },
    tablesToExcel() {
      this.showSDollar = true;
      setTimeout(() => {
        var table_elt = document.getElementsByClassName(
          "v-data-table__wrapper"
        )[0];
        var wb = XLSX.utils.table_to_book(table_elt, { raw: true });
        if (wb.Workbook) {
          wb.Workbook.Views[0]["RTL"] = true;
        } else {
          wb.Workbook = {};
          wb.Workbook["Views"] = [{ RTL: true }];
        }

        // Package and Release Data (`writeFile` tries to write and save an XLSB file)
        XLSX.writeFile(wb, "Report.xlsx");
        setTimeout(() => {
          this.showSDollar = false;
        }, 1000);
      }, 500);
    },
  },
};
</script>

<style scoped>
.printHeader {
  display: none !important;
}

@media print {
  .printHeader {
    display: block !important;
    padding: 10px;
  }

  .v-chip {
    color: black !important;
  }

  @page {
    size: A4 landscape;
  }

  * {
    direction: rtl !important;
    color-adjust: exact !important;
    zoom: 0.9;
  }

  .v-btn {
    display: none !important;
  }

  .v-card {
    box-shadow: none !important;
  }
}
</style>