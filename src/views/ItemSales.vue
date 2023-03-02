<template>
  <div id="itemSales" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف مبيعات المواد</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="tablesToExcel()">
        <v-icon left>la-download</v-icon>
        <span>تحميل</span>
      </v-btn>
    </v-app-bar>
    <v-card class="pa-5">
      <v-row>
        <v-col cols="2">
          <v-text-field
            label="من تاريخ"
            dense
            clearable
            v-model="search.dateFrom"
            hide-details
            outlined
            type="date"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            label="الى تاريخ"
            dense
            clearable
            v-model="search.dateTo"
            hide-details
            outlined
            type="date"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-autocomplete
            :items="users.filter((e) => e.roleId == 3)"
            item-text="username"
            item-value="idUser"
            outlined
            dense
            hide-details
            label="المشرف"
            v-model="selectedSuperVisor"
            @change="setDelegates()"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete
            item-value="idUser"
            item-text="username"
            hide-details
            outlined
            dense
            placeholder="المندوب"
            clearable
            v-model="selectedUser"
            :items="users"
          ></v-autocomplete>
        </v-col>
        <v-col cols="2">
          <v-btn @click="performSearch()" dark :color="$background" block>
            بحث
          </v-btn>
        </v-col>
      </v-row>
      <br />
      <v-simple-table>
        <thead>
          <tr>
            <th
              colspan="2"
              style="background-color: rgb(100, 100, 100); color: white"
            >
              المجموعة
            </th>
            <th colspan="2">المجموع</th>
            <th
              style="background-color: rgb(202, 248, 184)"
              class="text-center"
              colspan="2"
              v-for="group in itemGroups"
              :key="group.idItemGroup"
            >
              {{ group.itemGroupName }}
            </th>
          </tr>
          <tr>
            <th>#</th>
            <th>اسم الحساب</th>
            <th style="background-color: rgb(100, 248, 184)">المبيعات</th>
            <th style="background-color: rgb(202, 150, 184)">الاجمالي</th>
            <template v-for="group in itemGroups">
              <th
                style="background-color: rgb(100, 248, 184)"
                :key="'SALES_' + group.idItemGroup"
              >
                المبيعات
              </th>
              <th
                style="background-color: rgb(202, 150, 184)"
                :key="'TOTAL_' + group.idItemGroup"
              >
                الاجمالي
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, i) in selectedUser == null
              ? tableUsers
              : users.filter((e) => e.idUser == selectedUser)"
            :key="user.idUser"
          >
            <td>{{ i + 1 }}</td>
            <td width="200px">
              <span v-if="selectedUser == null">
                {{ user.delegateName || user.username }}</span
              >
              <span v-if="selectedUser != null"> {{ user.username }}</span>
            </td>
            <td
              style="background-color: rgb(132 232 232)"
              :key="'GROUPEDITEMSALES_' + `_${i}_` + user.idUser"
            >
              {{
                getTotalCount(user.idUser || user.delegateId).toLocaleString()
              }}
            </td>
            <th
              style="background-color: rgb(293 193 193)"
              :key="'GROUPEDITEMTOTAL_' + `_${i}_` + user.idUser"
            >
              {{
                getTotalByUser(user.idUser || user.delegateId).toLocaleString()
              }}
            </th>
            <template v-for="(group, index) in itemGroups">
              <td
                style="background-color: rgb(232 232 232)"
                :key="'ITEMSALES_' + `_${index}_` + user.idUser"
              >
                {{
                  getItemCountByUser(
                    user.idUser || user.delegateId,
                    group.idItemGroup
                  ).toLocaleString()
                }}
              </td>
              <th
                style="background-color: rgb(193 193 193)"
                :key="'ITEMTOTAL_' + `_${index}_` + user.idUser"
              >
                {{
                  getItemSalesByUser(
                    user.idUser || user.delegateId,
                    group.idItemGroup
                  ).toLocaleString()
                }}
              </th>
            </template>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">المجموع</td>
            <td colspan="1">{{ getTotalCountx().toLocaleString() }}</td>
            <td colspan="1">{{ getTotalPricex().toLocaleString() }}</td>
            <template v-for="(group, index) in itemGroups">
              <td
                style="background-color: rgb(232 232 132)"
                :key="'FOOTER_' + `_${index}_` + group.idItemGroup"
              >
                {{ getTotalCountByGroup(group.idItemGroup).toLocaleString() }}
              </td>
              <th
                style="background-color: rgb(232 232 132)"
                :key="'FOOTER_' + `_${index}_` + group.idItemGroup"
              >
                {{ getTotalPriceByGroup(group.idItemGroup).toLocaleString() }}
              </th>
            </template>
          </tr>
        </tfoot>
      </v-simple-table>
      <!--
      <v-simple-table>
        <thead>
          <tr>
            <th
              colspan="2"
              style="background-color: rgb(100, 100, 100); color: white"
            >
              اسم الحساب
            </th>
            <th
              style="background-color: rgb(202, 248, 184)"
              class="text-center"
              colspan="2"
              v-for="user in selectedUser == null
                ? tableUsers
                : users.filter((e) => e.idUser == selectedUser)"
              :key="user.idUser"
            >
              <span v-if="selectedUser == null">
                {{ user.delegateName || user.username }}</span
              >
              <span v-if="selectedUser != null"> {{ user.username }}</span>
            </th>
          </tr>
          <tr>
            <th>#</th>
            <th>المجموعة</th>
            <template
              v-for="user in selectedUser == null
                ? tableUsers
                : users.filter((e) => e.idUser == selectedUser)"
            >
              <th
                style="background-color: rgb(100, 248, 184)"
                :key="'SALES_' + user.idUser"
              >
                المبيعات
              </th>
              <th
                style="background-color: rgb(202, 150, 184)"
                :key="'TOTAL_' + user.idUser"
              >
                الاجمالي
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(group, index) in itemGroups" :key="group.idItemGroup">
            <td>{{ index + 1 }}</td>
            <td width="200px">
              {{ group.itemGroupName }}
            </td>
            <template
              v-for="user in selectedUser == null
                ? tableUsers
                : users.filter((e) => e.idUser == selectedUser)"
            >
              <td
                style="background-color: rgb(232 232 232)"
                :key="'ITEMSALES_' + `_${index}_` + user.idUser"
              >
                {{
                  getItemCountByUser(
                    user.idUser,
                    group.idItemGroup
                  ).toLocaleString()
                }}
              </td>
              <th
                style="background-color: rgb(193 193 193)"
                :key="'ITEMTOTAL_' + `_${index}_` + user.idUser"
              >
                {{
                  getItemSalesByUser(
                    user.idUser,
                    group.idItemGroup
                  ).toLocaleString()
                }}
              </th>
            </template>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">المجموع</td>
            <template
              v-for="(user, index) in selectedUser == null
                ? tableUsers
                : users.filter((e) => e.idUser == selectedUser)"
            >
              <td
                style="background-color: rgb(232 232 232)"
                :key="'GROUPEDITEMSALES_' + `_${index}_` + user.idUser"
              >
                {{ getTotalCount(user.idUser).toLocaleString() }}
              </td>
              <th
                style="background-color: rgb(193 193 193)"
                :key="'GROUPEDITEMTOTAL_' + `_${index}_` + user.idUser"
              >
                {{ getTotalByUser(user.idUser).toLocaleString() }}
              </th>
            </template>
          </tr>
        </tfoot>
      </v-simple-table>
      -->
    </v-card>
  </div>
</template>

<script>
import * as XLSX from "xlsx-js-style/dist/xlsx.bundle";
export default {
  name: "ItemSales",
  data: () => ({
    items: [],
    permissions: [],
    selectedGroupItem: null,
    selectedUser: null,
    itemGroups: [],
    users: [],
    tableUsers: [],
    selectedSuperVisor: 0,
    supervisors: [],
    manufactures: [],
    invoices: [],
    search: {
      invoiceType: 1,
      customerId: null,
      delegateId: null,
      deliveryId: null,
      invoiceId: null,
      dateFrom: null,
      dateTo: null,
    },
  }),
  created: function () {
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
    fetch() {
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
      this.$http
        .get(this.$baseUrl + "users")
        .then((res) => {
          this.users = res.data;
          this.tableUsers = res.data;
        })
        .finally(() => {
          loading.hide();
        });
      this.$http
        .get(this.$baseUrl + "item")
        .then((res) => {
          this.items = res.data;
        })
        .finally(() => {
          loading.hide();
        });
      this.$http
        .get(this.$baseUrl + "manufacture")
        .then((res) => {
          this.manufactures = res.data;
        })
        .finally(() => {
          loading.hide();
        });
      this.$http
        .get(this.$baseUrl + "itemGroup")
        .then((res) => {
          this.itemGroups = res.data;
        })
        .finally(() => {
          loading.hide();
        });
    },
    getItemSalesByUser(userId, groupId) {
      if (this.invoices.length == 0) {
        return 0;
      } else {
        let sum = 0;
        for (
          let i = 0;
          i < this.items.filter((e) => e.itemGroupId == groupId).length;
          i++
        ) {
          const item = this.items.filter((e) => e.itemGroupId == groupId)[i];
          let invoices = this.invoices.filter(
            (e) => e.createdBy == userId && e.itemId == item.idItem
          );
          for (let i = 0; i < invoices.length; i++) {
            sum = sum + invoices[i].total;
          }
        }

        return sum;
      }
    },
    getTotalByUser(userId) {
      let items =
        this.selectedGroupItem == null
          ? this.items
          : this.items.filter((e) => e.itemGroupId == this.selectedGroupItem);

      if (this.invoices.length == 0) {
        return 0;
      } else {
        let sum = 0;
        let invoices = this.invoices.filter((e) => e.createdBy == userId);
        for (let i = 0; i < invoices.length; i++) {
          let result = items.filter((e) => e.idItem == invoices[i].itemId);
          if (result.length > 0) {
            sum = sum + invoices[i].total;
          }
        }
        return sum;
      }
    },
    getItemCountByUser(userId, groupId) {
      if (this.invoices.length == 0) {
        return 0;
      } else {
        let sum = 0;
        for (
          let i = 0;
          i < this.items.filter((e) => e.itemGroupId == groupId).length;
          i++
        ) {
          const item = this.items.filter((e) => e.itemGroupId == groupId)[i];
          let invoices = this.invoices.filter(
            (e) => e.createdBy == userId && e.itemId == item.idItem
          );
          for (let i = 0; i < invoices.length; i++) {
            sum = sum + invoices[i].count;
          }
        }

        return sum;
      }
    },
    getTotalCountByGroup(groupId) {
      if (this.invoices.length == 0) {
        return 0;
      } else {
        let sum = 0;
        for (
          let i = 0;
          i < this.items.filter((e) => e.itemGroupId == groupId).length;
          i++
        ) {
          const item = this.items.filter((e) => e.itemGroupId == groupId)[i];
          let invoices = this.invoices.filter((e) => e.itemId == item.idItem);
          for (let i = 0; i < invoices.length; i++) {
            sum = sum + invoices[i].count;
          }
        }

        return sum;
      }
    },
    getTotalPriceByGroup(groupId) {
      if (this.invoices.length == 0) {
        return 0;
      } else {
        let sum = 0;
        for (
          let i = 0;
          i < this.items.filter((e) => e.itemGroupId == groupId).length;
          i++
        ) {
          const item = this.items.filter((e) => e.itemGroupId == groupId)[i];
          let invoices = this.invoices.filter((e) => e.itemId == item.idItem);
          for (let i = 0; i < invoices.length; i++) {
            sum = sum + invoices[i].total;
          }
        }

        return sum;
      }
    },
    getTotalCountx() {
      let sum = 0;
      let u = [];
      if (this.selectedUser == null) {
        u = this.tableUsers;
      } else {
        u = this.users.filter((e) => e.idUser == this.selectedUser);
      }
      for (let i = 0; i < u.length; i++) {
        sum = sum + this.getTotalCount(u[i].idUser || u[i].delegateId);
      }
      return sum;
    },
    getTotalPricex() {
      let sum = 0;
      let u = [];
      if (this.selectedUser == null) {
        u = this.tableUsers;
      } else {
        u = this.users.filter((e) => e.idUser == this.selectedUser);
      }
      for (let i = 0; i < u.length; i++) {
        sum = sum + this.getTotalByUser(u[i].idUser || u[i].delegateId);
      }
      return sum;
    },

    getTotalCount(userId) {
      let items =
        this.selectedGroupItem == null
          ? this.items
          : this.items.filter((e) => e.itemGroupId == this.selectedGroupItem);

      if (this.invoices.length == 0) {
        return 0;
      } else {
        let sum = 0;
        let invoices = this.invoices.filter((e) => e.createdBy == userId);
        for (let i = 0; i < invoices.length; i++) {
          let result = items.filter((e) => e.idItem == invoices[i].itemId);

          if (result.length > 0) {
            sum = sum + invoices[i].count;
          }
        }
        return sum;
      }
    },
    getItemPrice(id) {
      let item = this.items.filter((e) => e.idItem == id)[0].prices;
      if (item.length > 0) {
        return item.filter((e) => e.sellPriceId == 2)[0].price;
      } else {
        return "لا يوجد";
      }
    },
    getManufactureName(id) {
      if (this.manufactures.length == 0) {
        return "جار التحميل";
      } else {
        return this.manufactures.filter((e) => e.idCustomer == id)[0]
          .customerName;
      }
    },
    performSearch() {
      let loading = this.$loading.show();
      let query = "";
      if (this.search.invoiceType != null && this.search.invoiceType != "") {
        query = query + `&type=${this.search.invoiceType}`;
      }
      if (this.search.customerId != null && this.search.customerId != "") {
        query = query + `&customer=${this.search.customerId}`;
      }
      if (this.search.delegateId != null && this.search.delegateId != "") {
        query = query + `&user=${this.search.delegateId}`;
      }
      if (this.search.deliveryId != null && this.search.deliveryId != "") {
        query = query + `&delivery=${this.search.deliveryId}`;
      }
      if (this.search.invoiceId != null && this.search.invoiceId != "") {
        query = query + `&id=${this.search.invoiceId}`;
      }
      if (this.search.dateFrom != null && this.search.dateFrom != "") {
        query = query + `&dateRangeFrom=${this.search.dateFrom}`;
      }
      if (this.search.dateTo != null && this.search.dateTo != "") {
        query = query + `&dateRangeTo=${this.search.dateTo}`;
      }
      console.log(query);
      this.$http
        .get(this.$baseUrl + "invoice/invoiceContent?search=true" + query)
        .then((res) => {
          this.invoices = res.data.filter((e) => e.invoiceTypeId == 1);
          console.log(this.invoices);
        })
        .finally(() => loading.hide());
    },
    setDelegates() {
      this.selectedUser = null;
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "supervisorDelegates/userid/" +
            this.selectedSuperVisor
        )
        .then((res) => {
          this.tableUsers = res.data;
          console.log(this.tableUsers);
        })
        .finally(() => loading.hide());
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

<style>
td,
th {
  border: 1px #000000 solid !important;
  text-align: center !important;
}
</style>