<template>
  <div class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>الحسابات</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card no-elevation class="pa-10">
      <v-tabs v-model="selectedRoleId" centered>
        <v-tabs-slider :color="$background"></v-tabs-slider>

        <v-tab style="justify-content: center !important" v-for="(role, index) in roles" :key="role.idRole">
          {{ role.roleName }}
          &nbsp;&nbsp;&nbsp;&nbsp;
          <v-chip dark color="red" x-small>
            {{
              accounts.filter((user) => user.roleId == roles[index].idRole)
                .length
            }}
          </v-chip>
        </v-tab>
      </v-tabs>
      <br />
      <v-data-table :height="'60vh'" fixed-header :items-per-page="-1" :items="accounts.filter((user) => user.roleId == roles[selectedRoleId].idRole)
        "
        :headers="userInfo.roleId != 1 ? tableHeaders : selectedRoleId == 3 ? tableHeadersForDelegates : selectedRoleId == 2 ? tableHeadersForSuperVisor : tableHeaders">




        <template v-slot:[`item.username`]="{ item }">
          <v-text-field outlined dense hide-details :value="item.username"
            @change="changeUserName(item.idUser, $event)"></v-text-field>
          <v-card v-if="item.idUserInfo == null && userInfo.roleId == 1" class="pa-2 ma-2 white--text" color="error">يرجى
            تعيين سعر بيع
            للمستخدم</v-card>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms1`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewMonthlySales', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canViewMonthlySales')"
            v-model="item.canViewMonthlySales"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms2`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewMonthlyRestores', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canViewMonthlyRestores')"
            v-model="item.canViewMonthlyRestores"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms3`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewMonthlyDamaged', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canViewMonthlyDamaged')"
            v-model="item.canViewMonthlyDamaged"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms4`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewDailyItems', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canViewDailyItems')" v-model="item.canViewDailyItems"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms5`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canRestoreAllItems', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canRestoreAllItems')" v-model="item.canRestoreAllItems"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms6`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canCreateCustomer', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canCreateCustomer')" v-model="item.canCreateCustomer"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms7`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewContinueusCustomers', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canViewContinueusCustomers')"
            v-model="item.canViewContinueusCustomers"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms8`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewDelegateRail', $event)" :true-value="1"
            :false-value="0" v-if="checkPermission('canViewDelegateRail')"
            v-model="item.canViewDelegateRail"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 3" v-slot:[`item.perms9`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canEditCustomer', $event)" :true-value="1" :false-value="0"
            v-model="item.canEditCustomer"></v-checkbox>
        </template>


        <template v-if="selectedRoleId == 2" v-slot:[`item.perms10`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewDelegateRail', $event)" :true-value="1"
            :false-value="0" v-model="item.canViewDelegateRail"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 2" v-slot:[`item.perms11`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewMonthlySales', $event)" :true-value="1"
            :false-value="0" v-model="item.canViewMonthlySales"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 2" v-slot:[`item.perms12`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canViewContinueusCustomers', $event)" :true-value="1"
            :false-value="0" v-model="item.canViewContinueusCustomers"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 2" v-slot:[`item.perms13`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canCreateCustomer', $event)" :true-value="1"
            :false-value="0" v-model="item.canCreateCustomer"></v-checkbox>
        </template>
        <template v-if="selectedRoleId == 2" v-slot:[`item.perms14`]="{ item }">
          <v-checkbox @change="updatePermission(item.idUser, 'canEditCustomer', $event)" :true-value="1" :false-value="0"
            v-model="item.canEditCustomer"></v-checkbox>
        </template>


        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon @click="changePassword(item.idUser)">
            <v-icon :title="item.idInvoice">mdi-key</v-icon>
          </v-btn>
          <v-btn v-if="checkPermission('account_edit')" icon :to="'/user/' + item.idUser">
            <v-icon :title="item.idInvoice">mdi-account-edit-outline</v-icon>
          </v-btn>
          <v-btn v-if="checkPermission('account_edit')" plain small @click="unblock(item.idUser)">
            فتح الحظر
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="passwordDialog" width="500">
      <v-card>
        <v-card-title> تغيير كلمة المرور </v-card-title>

        <v-card-text>
          <v-text-field v-model="newPasswordField" outlined hide-details type="password"
            label="كلمة المرور الجديدة"></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="changePasswordConfirm()">
            تغيير
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "AccountsPage",
  data: () => ({
    permissions: [],
    accounts: [],
    roles: [],
    expanded: [],
    selectedUserId: 0,
    selectedRoleId: 0,
    passwordDialog: false,
    newPasswordField: "",
    tableHeaders: [
      { text: "اسم الحساب", value: "username" },
      { text: "كلمة المرور", value: "password" },
      { text: "الاجراءات", value: "actions" },
    ],
    tableHeadersForDelegates: [
      { text: "اسم الحساب", value: "username" },
      { text: "كلمة المرور", value: "password" },
      { text: "الاجراءات", value: "actions" },
      { text: "مشاهدة المبيعات الشهرية", value: "perms1" },
      { text: "مشاهدة الراجع الشهري", value: "perms2" },
      { text: "مشاهدة التالف الشهري", value: "perms3" },
      { text: "مشاهدة مبيعات المواد اليومية", value: "perms4" },
      { text: "امكانية استرجاع التالف اكثر من 50%", value: "perms5" },
      { text: "امكانية انشاء زبون جديد", value: "perms6" },
      { text: "مشاهدة الزبائن الدائميين والغير دائميين", value: "perms7" },
      { text: "مشاهدة حركة المندوب", value: "perms8" },
      { text: "امكانية تعديل معلومات الزبون", value: "perms9" },
    ],
    tableHeadersForSuperVisor: [
      { text: "اسم الحساب", value: "username" },
      { text: "كلمة المرور", value: "password" },
      { text: "الاجراءات", value: "actions" },
      { text: "مشاهدة المجموع", value: "perms10" },
      { text: "مشاهدة التفاصيل المالية", value: "perms11" },
      { text: "مشاهدة الزبائن الدائميين والغير دائميين", value: "perms12" },
      { text: "امكانية فرز على المشرفين", value: "perms13" },
      { text: "امكانية تعديل معلومات الزبون", value: "perms14" },
    ],
  }),
  methods: {
    logout(id) {
      this.$socket.auth.emit("logout", {
        userId: id,
      });
    },
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
        if (!this.checkPermission("accounts")) {
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
      let q = "users";
      if (this.userInfo.roleId == 1) {
        q = "users/unsecure/all";
      }
      this.$http
        .get(this.$baseUrl + q)
        .then((res) => {
          this.accounts = res.data;
        })
        .finally(() => loading.hide());
      this.$http.get(this.$baseUrl + "users/roles/all").then((res) => {
        this.roles = res.data;
        if (this.userInfo.roleId != 1) {
          this.roles = this.roles.filter((x) => x.idRole == 4);
        }
      });
    },
    changePassword(id) {
      this.selectedUserId = id;
      this.passwordDialog = true;
    },
    changePasswordConfirm() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/" + this.selectedUserId, {
          password: this.newPasswordField,
          logout: 1,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم تغيير كلمة المرور",
            duration: 3000,
          });
          this.logout(this.selectedUserId);
          this.passwordDialog = false;
          this.selectedUserId = 0;
          this.newPasswordField = "";
        })
        .finally(() => loading.hide());
    },
    unblock(id) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/" + id, {
          email: "0",
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم فتح الحظر",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    changeUserName(userId, e) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/" + userId, {
          username: e,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم تغيير اسم المستخدم",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    updatePermission(id, perm, e) {
      this.$http.put(this.$baseUrl + 'users/edit/userinfo/' + id, {
        [perm]: e
      });
    }
  },
  created: function () {
    this.fetch();
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userInfo() {
      return this.$store.getters.getLoginInfo;
    },
  },
};
</script>

<style></style>