<template>
  <div id="user" v-if="user != null" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>{{ user.username }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn @click="save()" icon>
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-app-bar>

    <v-card class="pa-10">
      <v-row>
        <v-col>
          <v-row>
            <v-col cols="12">
              <v-text-field outlined label="الاسم الكامل" v-model="userdata.fullname" hide-details></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field outlined label="العنوان" v-model="userdata.address" hide-details></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field outlined hide-details label="رقم الهاتف الاول"
                v-model="userdata.phoneNumber"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field outlined hide-details label="رقم الهاتف الثاني"
                v-model="userdata.secondPhoneNumber"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field outlined label="الهدف الشهري للمبيعات" type="number" hide-details
                v-model="userdata.monthlyTarget"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-autocomplete outlined label="سعر البيع" hide-details v-model="userdata.sellPriceId" :items="sellPrices"
                item-text="sellPriceName" item-value="idSellPrice"></v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-text-field outlined label="التحصيل الدراسي" hide-details v-model="userdata.education"></v-text-field>
            </v-col>
            <v-col v-if="![3, 4].includes(user.roleId) && userInfo.roleId == 1" cols="12">
              <v-autocomplete outlined label="التقرير العام - سعر البيع" hide-details
                v-model="userdata.overviewSellPrice" :items="overviewSellPrices" item-text="sellPriceName"
                item-value="idSellPrice"></v-autocomplete>
            </v-col>
            <v-col cols="4">
              <v-btn onclick="document.getElementById('filepicker').click()" block>
                <v-icon> mdi-cloud-outline </v-icon>
                &nbsp;&nbsp; تعديل صورة المستخدم
              </v-btn>
              <input id="filepicker" style="display: none" type="file" name="uploads" @change="selectFiles($event)"
                accept="image/png, image/gif, image/jpeg" />
              <img v-if="userdata.imagePath != null" :src="$baseUrl + 'files/' + userdata.imagePath" width="100%"
                id="imagePath" />
              <img v-if="userdata.imagePath == null" src="@/assets/no_image_placeholder.png" width="100%"
                id="imagePath" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <div v-if="user.roleId == 4">
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canViewMonthlySales')"
              label="مشاهدة المبيعات الشهرية" v-model="userdata.canViewMonthlySales"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" label="مشاهدة الراجع الشهري"
              v-if="checkPermission('canViewMonthlyRestores')" v-model="userdata.canViewMonthlyRestores"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" label="مشاهدة التالف الشهري"
              v-if="checkPermission('canViewMonthlyDamaged')" v-model="userdata.canViewMonthlyDamaged"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canViewDailyItems')"
              label="مشاهدة مبيعات المواد اليومية" v-model="userdata.canViewDailyItems"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canRestoreAllItems')"
              label="امكانية استرجاع التالف اكثر من 50%" v-model="userdata.canRestoreAllItems"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canCreateCustomer')"
              label="امكانية انشاء زبون جديد" v-model="userdata.canCreateCustomer"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canViewContinueusCustomers')"
              label="مشاهدة الزبائن الدائميين والغير دائميين"
              v-model="userdata.canViewContinueusCustomers"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canViewDelegateRail')"
              label="مشاهدة حركة المندوب" v-model="userdata.canViewDelegateRail"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" label="امكانية تعديل معلومات الزبون"
              v-model="userdata.canEditCustomer"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" label="امكانية حذف مادة من الفاتورة"
              v-model="userdata.canDeleteItemFromInvoice"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" label="امكانية اضافة هدية للزبون"
              v-model="userdata.canGiveAGift"></v-checkbox>
          </div>
          <div v-if="user.roleId == 3">
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canViewDelegateRail')"
              label="مشاهدة المجموع" v-model="userdata.canViewDelegateRail"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canViewMonthlySales2')"
              label="مشاهدة التفاصيل المالية" v-model="userdata.canViewMonthlySales"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canViewContinueusCustomers')"
              label="مشاهدة الزبائن الدائميين والغير دائميين"
              v-model="userdata.canViewContinueusCustomers"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" v-if="checkPermission('canCreateCustomer')"
              label="امكانية فرز على المشرفين" v-model="userdata.canCreateCustomer"></v-checkbox>
            <v-checkbox :true-value="1" :false-value="0" label="امكانية تعديل معلومات الزبون"
              v-model="userdata.canEditCustomer"></v-checkbox>
          </div>

          <div v-if="![3, 4].includes(user.roleId) && userInfo.roleId == 1">
            <v-checkbox :true-value="1" :false-value="0" label="تحديد البحث في التقرير العام"
              v-model="unlockOverviewReport"></v-checkbox>
            <v-text-field :disabled="unlockOverviewReport == 0" type="date" outlined label="تاريخ بدء البحث"
              v-model="ovStartDate"></v-text-field>
            <v-text-field :disabled="unlockOverviewReport == 0" type="date" outlined label="تاريخ انتهاء البحث"
              v-model="ovEndDate"></v-text-field>
            <v-btn color="success" @click="saveUnlockDate()">حفظ صلاحية التقرير العام</v-btn>


          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import * as moment from 'moment';
export default {
  name: "User",
  data: () => ({
    userId: 0,
    userdata: {
      permissions: [],
      fullname: null,
      address: null,
      phoneNumber: null,
      secondPhoneNumber: null,
      imagePath: null,
      monthlyTarget: null,
      sellPriceId: 0,
      education: null,
      canViewMonthlySales: 0,
      canViewMonthlyRestores: 0,
      canViewMonthlyDamaged: 0,
      canViewDailyItems: 0,
      canRestoreAllItems: 0,
      canCreateCustomer: 0,
      canViewContinueusCustomers: 0,
      canViewDelegateRail: 0,
      canEditCustomer: 0,
      overviewSellPrice: 0,
      canDeleteItemFromInvoice: 0,
      canGiveAGift: 0,
    },
    unlockOverviewReport: 0,
    ovStartDate: null,
    ovEndDate: null,
    user: null,
    sellPrices: [],
    overviewSellPrices: [
      { idSellPrice: 0, sellPriceName: 'الكل' }
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      setTimeout(() => {
        if (!this.checkPermission("visits")) {
          this.$toast.open({
            type: "error",
            message: "غير مصرح لك بمشاهدة هذه الصفحة",
            duration: 3000,
          });
          this.$router.go(-1);
        }
      }, 1000);
    });
    // LOAD PERMS END
    this.userId = this.$route.params.id;
    this.fetch();
  },
  methods: {
    checkPermission(permissionKey) {
      if (this.permissions == undefined) {
        return true;
      }
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetch() {
      let loading = this.$loading.show();
      this.$http.get(this.$baseUrl + "users/" + this.userId).then((res) => {
        this.user = res.data;
        this.$http
          .get(this.$baseUrl + "users/userinfo/" + this.userId)
          .then((res) => {
            this.userdata = res.data;
            this.unlockOverviewReport = this.userdata.unlockOverviewReport;
            this.ovStartDate = moment(this.userdata.ovStartDate).format('YYYY-MM-DD');
            this.ovEndDate = moment(this.userdata.ovEndDate).format('YYYY-MM-DD');
          })
          .catch((err) => {
            if (err.response.status == 404) {
              this.$http
                .post(this.$baseUrl + "users/new/userInfo", {
                  userId: this.userId * 1,
                  sellPriceId: 1,
                  monthlyTarget: 0,
                })
                .finally(() => {
                  this.fetch();
                  return;
                });
            }
          })
          .finally(() => loading.hide());
      });
      this.$http.get(this.$baseUrl + "sellprice").then((res) => {
        this.sellPrices = res.data;
        this.overviewSellPrices.push(...res.data)
      });
    },
    selectFiles(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      for (let i = 0; i < files.length; i++) {
        this.image = files[i];
      }
      let loading = this.$loading.show();
      let formData = new FormData();
      formData.append("userImage", this.image);
      this.$http
        .put(this.$baseUrl + "users/updateImage/" + this.userId, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: " تم تغيير الصورة",
            duration: 3000,
          });
          document
            .getElementById("imagePath")
            .setAttribute("src", URL.createObjectURL(this.image));
        })
        .finally(() => loading.hide());
    },
    save() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/userinfo/" + this.userId, {
          fullname: this.userdata.fullname,
          address: this.userdata.address,
          phoneNumber: this.userdata.phoneNumber,
          secondPhoneNumber: this.userdata.secondPhoneNumber,
          monthlyTarget: this.userdata.monthlyTarget,
          sellPriceId: this.userdata.sellPriceId,
          education: this.userdata.education,
          canViewMonthlySales: this.userdata.canViewMonthlySales,
          canViewMonthlyRestores: this.userdata.canViewMonthlyRestores,
          canViewMonthlyDamaged: this.userdata.canViewMonthlyDamaged,
          canViewDailyItems: this.userdata.canViewDailyItems,
          canRestoreAllItems: this.userdata.canRestoreAllItems,
          canCreateCustomer: this.userdata.canCreateCustomer,
          canViewContinueusCustomers: this.userdata.canViewContinueusCustomers,
          canViewDelegateRail: this.userdata.canViewDelegateRail,
          canEditCustomer: this.userdata.canEditCustomer,
          overviewSellPrice: this.userdata.overviewSellPrice,
          canDeleteItemFromInvoice: this.userdata.canDeleteItemFromInvoice,
          canGiveAGift: this.userdata.canGiveAGift,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: " تم تعديل المعومات",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    saveUnlockDate() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/userinfo/" + this.userId, {
          unlockOverviewReport: this.unlockOverviewReport,
          ovStartDate: this.ovStartDate,
          ovEndDate: this.ovEndDate,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: " تم تعديل المعومات",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    }
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