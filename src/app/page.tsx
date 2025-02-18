"use client"

import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { useForm as useFormspree } from "@formspree/react"
import { useState } from "react"
import { 
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperSeparator
} from "@/components/ui/stepper"
import { cn } from "@/lib/utils"

type FormData = {
  // Step 1: Basic Information
  fullName: string
  email: string
  phone?: string
  companyName?: string
  website?: string

  // Step 2: Project Information
  projectType: string
  projectPurpose?: string
  targetAudience?: string
  budgetRange?: string
  completionTime: string

  // Step 3: Design Preferences
  websiteExamples?: string
  designPreferences: string[]
  colorPreferences?: string
  hasLogo: string
  requiredPages: string[]
  contentReady: string

  // Step 4: Technical Requirements
  needsAdmin: string
  needsAuth: string
  needsPayment: string
  needsContactForm: string
  needsMultiLang: string

  // Step 5: Additional Information
  previousExperience: string
  additionalNotes?: string
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formState, formSubmit] = useFormspree("mzzdklon")
  const methods = useForm<FormData>({
    mode: "onChange"
  })
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const { watch } = methods

  // Form değerlerini gerçek zamanlı izle
  const watchedValues = watch()

  const steps = [
    { step: 1, title: "Temel Bilgiler"},
    { step: 2, title: "Proje Bilgileri"},
    { step: 3, title: "Tasarım Tercihleri"},
    { step: 4, title: "Teknik Gereksinimler"},
    { step: 5, title: "Diğer Bilgiler" }
  ]

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!watchedValues.fullName && !!watchedValues.email
      case 2:
        return !!watchedValues.projectType && !!watchedValues.completionTime
      case 3:
        return watchedValues.designPreferences?.length > 0 && 
               watchedValues.requiredPages?.length > 0 && 
               !!watchedValues.hasLogo && 
               !!watchedValues.contentReady
      case 4:
        return !!watchedValues.needsAdmin && 
               !!watchedValues.needsAuth && 
               !!watchedValues.needsPayment && 
               !!watchedValues.needsContactForm && 
               !!watchedValues.needsMultiLang
      case 5:
        return !!watchedValues.previousExperience
      default:
        return false
    }
  }

  const handleStepChange = (step: number) => {
    // Sadece önceki adımlara dönüşe izin ver
    if (step < currentStep) {
      setCurrentStep(step)
    }
    // Sonraki adımlara geçiş için mevcut adımın geçerli olması gerekir
    else if (step > currentStep && isStepValid(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(step)
    }
  }

  // Bir adıma kadar olan tüm adımların tamamlanıp tamamlanmadığını kontrol et
  const isStepAccessible = (step: number) => {
    for (let i = 1; i < step; i++) {
      if (!completedSteps.includes(i)) {
        return false
      }
    }
    return true
  }

  const onSubmit = async (data: FormData) => {
    // Convert arrays to strings for Formspree
    const formData = {
      ...data,
      designPreferences: data.designPreferences.join(", "),
      requiredPages: data.requiredPages.join(", ")
    }
    await formSubmit(formData)
    
    if (formState.succeeded) {
      console.log("Form başarıyla gönderildi!")
    } else {
      console.log("Form gönderimi başarısız oldu!")
    }
  }

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Stepper */}
        <div className="mb-8">
          <Stepper value={currentStep} onValueChange={handleStepChange}>
            {steps.map(({ step, title }) => (
              <StepperItem 
                key={step} 
                step={step} 
                completed={completedSteps.includes(step) && step < currentStep}
                disabled={!isStepAccessible(step) || (step > currentStep && !isStepValid(currentStep))}
                className="relative flex-1 !flex-col"
              >
                <StepperTrigger className="flex-col gap-3">
                  <StepperIndicator>
                    {step}
                  </StepperIndicator>
                  <div className="space-y-0.5 px-2">
                    <StepperTitle>{title}</StepperTitle>
                  </div>
                </StepperTrigger>
                {step < steps.length && (
                  <StepperSeparator 
                    className={cn(
                      "absolute inset-x-0 left-[calc(50%+0.75rem+0.125rem)] top-3 -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none",
                      step + 1 <= currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </StepperItem>
            ))}
          </Stepper>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Temel Bilgiler</h2>
                  
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-medium">
                      Ad Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...methods.register("fullName", { required: true })}
                      type="text"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      E-posta Adresi <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...methods.register("email", { required: true })}
                      type="email"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium">
                      Telefon Numarası
                    </label>
                    <input
                      {...methods.register("phone")}
                      type="tel"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="companyName" className="block text-sm font-medium">
                      Şirket Adı
                    </label>
                    <input
                      {...methods.register("companyName")}
                      type="text"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="website" className="block text-sm font-medium">
                      Web Sitesi (Varsa)
                    </label>
                    <input
                      {...methods.register("website")}
                      type="url"
                      className="w-full p-2 border rounded-md"
                      placeholder="https://"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Proje Bilgileri</h2>

                  <div className="space-y-2">
                    <label htmlFor="projectType" className="block text-sm font-medium">
                      Proje Türü <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...methods.register("projectType", { required: true })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Seçiniz</option>
                      <option value="new">Yeni Web Sitesi</option>
                      <option value="update">Mevcut Site Güncellemesi</option>
                      <option value="ecommerce">E-ticaret Sitesi</option>
                      <option value="corporate">Kurumsal Site</option>
                      <option value="portfolio">Kişisel Portfolyo</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="projectPurpose" className="block text-sm font-medium">
                      Projenin Amacı
                    </label>
                    <textarea
                      {...methods.register("projectPurpose")}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="targetAudience" className="block text-sm font-medium">
                      Hedef Kitle
                    </label>
                    <textarea
                      {...methods.register("targetAudience")}
                      className="w-full p-2 border rounded-md"
                      placeholder="Kimler bu siteyi ziyaret edecek?"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="budgetRange" className="block text-sm font-medium">
                      Bütçe Aralığı
                    </label>
                    <select
                      {...methods.register("budgetRange")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Seçiniz</option>
                      <option value="5000-10000">5.000₺ - 10.000₺</option>
                      <option value="10000-20000">10.000₺ - 20.000₺</option>
                      <option value="20000-50000">20.000₺ - 50.000₺</option>
                      <option value="50000+">50.000₺ ve üzeri</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="completionTime" className="block text-sm font-medium">
                      Projenin Tamamlanma Süresi <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...methods.register("completionTime", { required: true })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Seçiniz</option>
                      <option value="1week">1 Hafta</option>
                      <option value="2weeks">2 Hafta</option>
                      <option value="3weeks">3 Hafta</option>
                      <option value="1month">1 Ay</option>
                      <option value="2months">2 Ay</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Tasarım ve İçerik Tercihleri</h2>

                  <div className="space-y-2">
                    <label htmlFor="websiteExamples" className="block text-sm font-medium">
                      Beğendiğiniz Web Siteleri (Varsa Örnekler)
                    </label>
                    <textarea
                      {...methods.register("websiteExamples")}
                      className="w-full p-2 border rounded-md"
                      placeholder="Örnek site linklerini buraya ekleyebilirsiniz"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Tasarım Tercihleri
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Minimal", "Modern", "Kurumsal", "Renkli", "Eğlenceli"].map((style) => (
                        <label key={style} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...methods.register("designPreferences")}
                            value={style.toLowerCase()}
                            className="rounded"
                          />
                          <span>{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="colorPreferences" className="block text-sm font-medium">
                      Renk ve Stil Tercihleri
                    </label>
                    <input
                      {...methods.register("colorPreferences")}
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Marka renkleriniz varsa belirtiniz"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Logo ve Kurumsal Kimlik Dosyaları Var mı?
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          {...methods.register("hasLogo")}
                          value="true"
                        />
                        <span>Evet</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          {...methods.register("hasLogo")}
                          value="false"
                        />
                        <span>Hayır</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Web Sitesinde Hangi Sayfalar Olmalı?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Anasayfa",
                        "Hakkımızda",
                        "İletişim",
                        "Blog",
                        "Ürünler",
                        "Hizmetler",
                        "Portfolyo",
                        "SSS"
                      ].map((page) => (
                        <label key={page} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...methods.register("requiredPages")}
                            value={page.toLowerCase()}
                            className="rounded"
                          />
                          <span>{page}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Metin ve Görseller Hazır mı?
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          {...methods.register("contentReady")}
                          value="true"
                        />
                        <span>Evet</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          {...methods.register("contentReady")}
                          value="false"
                        />
                        <span>Hayır</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Teknik Gereksinimler</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <label className="text-sm font-medium">
                        Admin Paneli olacak mı? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsAdmin", { required: true })}
                            value="true"
                          />
                          <span>Evet</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsAdmin", { required: true })}
                            value="false"
                          />
                          <span>Hayır</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <label className="text-sm font-medium">
                        Üye Girişi olacak mı? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsAuth", { required: true })}
                            value="true"
                          />
                          <span>Evet</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsAuth", { required: true })}
                            value="false"
                          />
                          <span>Hayır</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <label className="text-sm font-medium">
                        Sepet ya da ödeme entegrasyonu olacak mı? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsPayment", { required: true })}
                            value="true"
                          />
                          <span>Evet</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsPayment", { required: true })}
                            value="false"
                          />
                          <span>Hayır</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <label className="text-sm font-medium">
                        Teklif/Randevu formu olacak mı? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsContactForm", { required: true })}
                            value="true"
                          />
                          <span>Evet</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsContactForm", { required: true })}
                            value="false"
                          />
                          <span>Hayır</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <label className="text-sm font-medium">
                        Dil seçeneği olacak mı? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsMultiLang", { required: true })}
                            value="true"
                          />
                          <span>Evet</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            {...methods.register("needsMultiLang", { required: true })}
                            value="false"
                          />
                          <span>Hayır</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Diğer Bilgiler</h2>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Daha önce bir web sitesi projesi yaptırdınız mı? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          {...methods.register("previousExperience", { required: true })}
                          value="true"
                        />
                        <span>Evet</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          {...methods.register("previousExperience", { required: true })}
                          value="false"
                        />
                        <span>Hayır</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="additionalNotes" className="block text-sm font-medium">
                      Eklemek İstedikleriniz
                    </label>
                    <textarea
                      {...methods.register("additionalNotes")}
                      className="w-full p-2 border rounded-md"
                      rows={4}
                      placeholder="Projeniz hakkında eklemek istediğiniz diğer detayları buraya yazabilirsiniz"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Geri
                </button>
              )}
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="ml-auto px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İleri
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={formState.submitting || !isStepValid(currentStep)}
                  className="ml-auto px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Gönder
                </button>
              )}
            </div>
          </form>
        </FormProvider>

        {formState.succeeded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-green-50 text-green-800 rounded-md"
          >
            <p className="text-center">
              Formunuz başarıyla gönderildi! En kısa sürede size geri dönüş yapacağım.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
