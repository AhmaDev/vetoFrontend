<template>
  <div id="salesReportPage">
    <v-app-bar app>
      <v-toolbar-title>كشف مبيعات المواد</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="tablesToExcel()">
        <v-icon left>la-download</v-icon>
        <span>تحميل</span>
      </v-btn>
    </v-app-bar>
    <v-card class="pa-10 ma-10">
      <v-row>
        <v-col cols="2">
          <v-text-field label="من تاريخ" dense clearable v-model="search.dateFrom" hide-details outlined
            type="date"></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field label="الى تاريخ" dense clearable v-model="search.dateTo" hide-details outlined
            type="date"></v-text-field>
        </v-col>
        <v-col>
          <v-autocomplete clearable :items="supervisors" item-text="username" item-value="idUser" outlined dense
            hide-details label="المشرف" v-model="selectedSuperVisor"></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete clearable item-value="idItemGroup" item-text="itemGroupName" hide-details outlined dense
            placeholder="المجموعة" v-model="selectedGroupId" :items="groups"></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete :disabled="selectedSuperVisor != null" item-value="idUser" item-text="username" outlined
            hide-details dense placeholder="المندوب" clearable v-model="selectedUser" :items="users"></v-autocomplete>
          <small v-if="selectedSuperVisor != null" class="error--text">لا يمكنك اختيار مشرف ومندوب بنفس الوقت</small>
        </v-col>
        <v-col cols="1">
          <v-btn @click="performSearch()" dark :color="$background" block>
            بحث
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table hide-default-footer class="mt-10" v-if="showTable" sort-by="total" sort-desc :items-per-page="-1"
        :items="finalData" :headers="headers">
        <template v-slot:[`item.total`]="{ item }">
          <span :class="item.total == 0 ? `error--text` : `success--text`" class="font-weight-bold">{{
            (item.total).toLocaleString() }}</span>
        </template>
        <template v-slot:[`item.count`]="{ item }">
          <span :class="item.count == 0 ? `error--text` : `success--text`" class="font-weight-bold">{{
            (item.count).toLocaleString() }}</span>
        </template>
        <template v-slot:[`item.supervisors`]="{ item }">
          <b class="error--text" v-if="item.supervisor.length == 0">لا يوجد</b>
          <v-chip small class="mx-1" v-for="sv in item.supervisor" :key="sv">{{supervisors.filter(e => e.idUser ==
            sv)[0].username}} , </v-chip>
        </template>
        <template v-slot:[`body.append`]>
          <tr class="sticky-table-footer">
            <td class="primary--text font-weight-bold">المجموع</td>
            <td></td>
            <td>{{finalData.reduce((a, b) => a + b.count, 0).toLocaleString()}}</td>
            <td>{{finalData.reduce((a, b) => a + b.total, 0).toLocaleString()}}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import * as XLSX from "xlsx-js-style/dist/xlsx.bundle";
export default {
  data() {
    return {
      finalData: [],
      users: [],
      items: [],
      groups: [],
      manufacturers: [],
      supervisors: [],
      showTable: false,
      sales: [],
      headers: [
        { text: "المندوب", value: "username" },
        { text: "المشرفين", value: "supervisors" },
        { text: "المبيعات", value: "count" },
        { text: "الاجمالي", value: "total" }
      ],
      selectedSuperVisor: null,
      selectedGroupId: null,
      selectedUser: null,
      search: {
        dateFrom: null,
        dateTo: null
      },
    };
  },
  created() {
    this.getCurrentDate().then((value) => {
      this.search.dateFrom = value;
      this.search.dateTo = value;
    });
    this.fetch();
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    async fetch() {
      // LOAD PERMS START
      this.auth().then((res) => {
        this.permissions = res.permissions;
        // CHECK IF CAN SEE THIS PAGE
        if (!this.checkPermission("itemsSales")) {
          this.$toast.open({
            type: "error",
            message: "غير مصرح لك بمشاهدة هذه الصفحة",
            duration: 3000,
          });
          this.$router.go(-1);
        }
      });
      // LOAD PERMS END
      let loading = this.$loading.show();
      try {
        const allUsers = await this.$http.get(this.$baseUrl + "users");
        const supervisorDelegates = await this.$http.get(this.$baseUrl + "supervisorDelegates");
        this.groups = (await this.$http.get(this.$baseUrl + "itemGroup")).data;
        this.items = (await this.$http.get(this.$baseUrl + "item")).data;
        this.users = allUsers.data.filter(e => [3, 4].includes(e.roleId));
        this.supervisors = allUsers.data.filter(e => e.roleId == 3);
        this.supervisors.forEach((e) => {
          let supervisor = supervisorDelegates.data.filter((s) => s.supervisorId == e.idUser).map((s) => s.delegateId);
          e.delegates = this.users.filter((u) => supervisor.includes(u.idUser));
        });
        this.users.forEach((e) => {
          e.supervisor = supervisorDelegates.data.filter((s) => s.delegateId == e.idUser).map((s) => s.supervisorId);
        });
        // this.performSearch();
        console.log("supervisors", this.supervisors);
        console.log("items", this.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        loading.hide();
      }
    },
    async performSearch() {
      let loading = this.$loading.show();
      this.showTable = false;
      try {
        let query = `?dateRangeFrom=${this.search.dateFrom}&dateRangeTo=${this.search.dateTo}`;
        const response = await this.$http.get(this.$baseUrl + "invoice/invoiceContent" + query);
        this.sales = response.data;
        if (this.selectedGroupId != null) {
          const items = this.items.filter((e) => e.itemGroupId == this.selectedGroupId).map((e) => e.idItem);
          this.sales = this.sales.filter((e) => items.includes(e.itemId));
        }
        this.users.forEach((e) => {
          e.total = this.sales.filter((s) => s.createdBy == e.idUser).reduce((a, b) => a + b.total, 0);
          e.count = this.sales.filter((s) => s.createdBy == e.idUser).reduce((a, b) => a + b.count, 0);
        });
        if (this.selectedSuperVisor != null) {
          const sp = this.supervisors.filter((e) => e.idUser == this.selectedSuperVisor)[0];
          this.finalData = this.users.filter((e) => sp.delegates.map((s) => s.idUser).includes(e.idUser));
        } else {
          if (this.selectedUser != null) {
            this.finalData = this.users.filter((e) => e.idUser == this.selectedUser);
          } else {
            this.finalData = this.users;
          }
        }
        this.showTable = true;
        console.log("sales", this.finalData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        loading.hide();
      }
    },
    tablesToExcel() {
      setTimeout(() => {
        var table_elt = document.getElementsByClassName(
          "v-data-table__wrapper"
        )[0];
        var wb = XLSX.utils.table_to_book(table_elt, { raw: true, origin: 1 });
        if (wb.Workbook) {
          wb.Workbook.Views[0]["RTL"] = true;
        } else {
          wb.Workbook = {};
          wb.Workbook["Views"] = [{ RTL: true }];
        }
        var ws = wb.Sheets["Sheet1"];
        ws['!cols'].push({ width: 20 });
        ws['!cols'].push({ width: 20 });
        ws['!cols'].push({ width: 20 });
        ws['!cols'].push({ width: 20 });
        XLSX.utils.sheet_add_aoa(ws, [["تقرير مبيعات", `المجموعة: ${this.selectedGroupId == null ? "الكل" : this.groups.filter(e => e.idItemGroup == this.selectedGroupId)[0].itemGroupName}`, ``, ""]], { origin: 0 });



        // Package and Release Data (`writeFile` tries to write and save an XLSB file)
        XLSX.writeFile(wb, "Report.xlsx");
        setTimeout(() => {
        }, 1000);
      }, 500);
    },
  }
}
</script>

<style></style>